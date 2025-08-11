import { relations } from 'drizzle-orm'
import { boolean, pgTable, integer, uuid, text, timestamp } from 'drizzle-orm/pg-core'




export const files = pgTable("files", {
    id: uuid('id').defaultRandom().primaryKey(),

    //basic file/folder information
    name: text("name").notNull(),
    path: text("path").notNull(),
    size: integer("size").notNull(),
    type: text("type").notNull(),
    fileUrl: text("fileUrl"),
    thumbnail: text("thumbnail"),

    userId: text("userid_id").notNull(),
    parentId: uuid("parent_id"),


    isFolder: boolean("is_folder").default(false).notNull(),
    isStarred: boolean("is_starred").default(false).notNull(),
    isTrashed: boolean("is_trashed").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export const filesRelations = relations(files, ({ one, many }) => ({

    parent: one(files,{
        fields: [files.parentId],
        references:[files.id]
    }),
    
    children:many(files),

}))





export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;

