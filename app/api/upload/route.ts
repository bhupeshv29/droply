import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ja } from "zod/locales";



export async function POST(request: NextResponse) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "Unauthorization" }, { status: 401 });
        }

        const body = await request.json()
        const { imagekit, userId: bodyUserId } = body;

        if (bodyUserId !== userId) {
            return NextResponse.json({ error: "Unauthorization" }, { status: 401 });

        }
        if (!imagekit || !imagekit.url) {
            return NextResponse.json({ error: "Invalid file upload data" }, { status: 401 });

        }

        const fileData = {
            name: imagekit.name || "Untitled",
            path: imagekit.filePath || `/droply/${userId}/${imagekit.name}`,
            size: imagekit.size || 0,
            type: imagekit.fileType || "image",
            fileUrl: imagekit.url,
            thumbnailUrl: imagekit.thumbnailUrl || null,
            userId: userId,
            parentId: null, // Root level by default
            isFolder: false,
            isStarred: false,
            isTrashed: false,
        };

        const [newFile] = await db.insert(files).values(fileData).returning();
        return NextResponse.json(newFile);

    } catch (error) {
        console.error("Error saving file:", error);
        return NextResponse.json(
            { error: "Failed to save file information" },
            { status: 500 }
        );
    }
}