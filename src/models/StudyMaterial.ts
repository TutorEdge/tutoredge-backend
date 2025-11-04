import { Schema, model, Document, Types } from "mongoose";

export interface IFileMeta {
  filename: string;
  url: string;
  size?: number;
  mimetype?: string;
}

export interface IStudyMaterial extends Document {
  material_title: string;
  subject: string;
  class_grade: string;
  description?: string;
  files: IFileMeta[];
  share_with_all: boolean;
  created_by: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const FileSchema = new Schema<IFileMeta>(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number },
    mimetype: { type: String }
  },
  { _id: false }
);

const StudyMaterialSchema = new Schema<IStudyMaterial>(
  {
    material_title: { type: String, required: true },
    subject: { type: String, required: true },
    class_grade: { type: String, required: true },
    description: { type: String, default: "" },
    files: { type: [FileSchema], default: [] },
    share_with_all: { type: Boolean, default: false },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export default model<IStudyMaterial>("StudyMaterial", StudyMaterialSchema);
