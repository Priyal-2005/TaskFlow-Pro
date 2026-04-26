import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Ensure owner is always in the members array before saving
projectSchema.pre("save", function (next) {
  if (this.owner && !this.members.some((m) => m.equals(this.owner))) {
    this.members.push(this.owner);
  }
  next();
});

const Project = mongoose.model("Project", projectSchema);
export default Project;
