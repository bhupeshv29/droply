import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import ImageKit from "imagekit";
import { NextResponse } from "next/server";


const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

export async function DELETE(
    request: NextResponse,
    props: { params: Promise<{ fileId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { fileId } = await props.params;

        if (!fileId) {
            return NextResponse.json(
                { error: "File ID is required" },
                { status: 400 }
            );
        }

        // Get the file to be deleted
        const [file] = await db
            .select()
            .from(files)
            .where(and(eq(files.id, fileId), eq(files.userId, userId)));

        if (!file) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }
        if (!file.isFolder) {
            try {
                let imagekitFileId = null;
                if (file.fileUrl) {
                    const urlWithoutQuery = file.fileUrl.split("?")[0];
                    imagekitFileId = urlWithoutQuery.split("/").pop();

                }

                if (!imagekitFileId && file.path) {
                    imagekitFileId = file.path.split("/").pop();
                }
                if (imagekitFileId) {
                    try {
                        const searchResults = await imagekit.listFiles({
                            name: imagekitFileId,
                            limit: 1,
                        });

                        if (searchResults && searchResults.length > 0) {
                            const result = searchResults[0];

                            // Check if it's a file before accessing fileId
                            if (result.type === 'file') {
                                await imagekit.deleteFile(result.fileId);
                            } else {
                                console.log('Found folder instead of file, skipping deletion');
                            }
                        } else {
                            // Fallback to using the imagekitFileId directly
                            await imagekit.deleteFile(imagekitFileId);
                        }
                    } catch (searchError) {
                        console.error(`Error searching for file in ImageKit:`, searchError);
                        await imagekit.deleteFile(imagekitFileId);
                    }
                }

            } catch (error) {
                console.error(`Error deleting file ${fileId} from ImageKit:`, error);

            }
        }

        const [deletedFile] = await db
            .delete(files)
            .where(and(eq(files.id, fileId), eq(files.userId, userId)))
            .returning();

        return NextResponse.json({
            success: true,
            message: "File deleted successfully",
            deletedFile,
        });

    } catch (error) {
        console.error("Error deleting file:", error);
        return NextResponse.json(
            { error: "Failed to delete file" },
            { status: 500 }
        );
    }

}