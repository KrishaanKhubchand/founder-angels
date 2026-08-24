/* eslint-disable */
import type { DataModelFromSchemaDefinition } from "convex/server";
import type schema from "../schema.js";

export type DataModel = DataModelFromSchemaDefinition<typeof schema>;
export type TableNames = keyof DataModel & string;
export type Doc<TableName extends TableNames> = DataModel[TableName]["document"];
export type Id<TableName extends TableNames> = DataModel[TableName]["document"]["_id"];
