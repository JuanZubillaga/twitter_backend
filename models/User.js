module.exports = (mongoose) => {
  const Schema = mongoose.Schema;
  const userSchema = new Schema(
    {
      firstname: { type: String, required: true },
      lastname: { type: String, required: true },
      username: { type: String, required: true },
      email: { type: String, required: true },
      password: { type: String, required: true },
      bio: String,
      avatar: String,
      tweets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tweet" }],
      following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    {
      virtuals: {
        fullname: {
          get() {
            return this.firstname + " " + this.lastname;
          },
        },
      },
    },
  );
  userSchema.virtual("fullname").get(function () {
    return this.firstname + " " + this.lastname;
  });
  const User = mongoose.model("User", userSchema);
  return User;
};
