import React, { useState } from "react";

function Report() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Title:", title);
    console.log("Description:", description);
    console.log("Image:", image);

    alert("Issue Submitted Successfully 🚀");

    // Later we will connect this to backend
  };

  return (
    <section className="min-h-screen bg-slate-900 text-white px-6 py-24">
      <div className="max-w-3xl mx-auto bg-white/5 p-10 rounded-xl border border-white/10">

        <h2 className="text-3xl font-bold mb-8 text-center">
          Report a Civic Issue
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title */}
          <div>
            <label className="block mb-2 text-gray-300">
              Issue Title
            </label>
            <input
              type="text"
              className="w-full p-3 rounded-lg bg-slate-800 border border-gray-600 focus:border-sky-400 outline-none"
              placeholder="e.g., Large pothole near Main Street"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 text-gray-300">
              Description
            </label>
            <textarea
              rows="4"
              className="w-full p-3 rounded-lg bg-slate-800 border border-gray-600 focus:border-sky-400 outline-none"
              placeholder="Describe the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block mb-2 text-gray-300">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-sky-500 file:text-white
              hover:file:bg-sky-600"
              required
            />
          </div>

          {/* Preview */}
          {preview && (
            <div className="mt-4">
              <p className="mb-2 text-gray-300">Image Preview:</p>
              <img
                src={preview}
                alt="Preview"
                className="rounded-lg border border-gray-600 max-h-60"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 transition duration-300 rounded-lg font-semibold shadow-lg shadow-sky-500/30"
          >
            Submit Issue
          </button>

        </form>
      </div>
    </section>
  );
}

export default Report;
