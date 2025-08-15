import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";



export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ fileId: string }> }
) {
    try {

        const { userId } = await auth()
        if (!userId) { return NextResponse.json({ error: "unauthorized" }, { status: 401 }) }

        const { fileId } = await props.params;

        if (!fileId) { return NextResponse.json({ error: "file ID is required " }, { status: 400 }) };

        const [file] = await db.select().from(files).where(and(eq(files.id, fileId), eq(files.userId, userId)))

        if (!file) return NextResponse.json({ error: "file not found" }, { status: 404 })

        const updatedFiles = await db.update(files).set({ isTrashed: !file.isTrashed }).where(and(eq(files.id, fileId), eq(files.userId, userId))).returning();

        console.log(updatedFiles);


        const action = updatedFiles[0].isTrashed ? "moved to trash" : "restored";
        return NextResponse.json({
            ...updatedFiles,
            message: `File ${action} successfully`,
        });
    } catch (error) {
        console.error("Error starring file:", error);
        return NextResponse.json(
            { error: "Failed to update file" },
            { status: 500 }
        );

    }

}