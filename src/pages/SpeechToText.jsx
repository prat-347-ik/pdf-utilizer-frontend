import { useState } from "react";
import { convertSpeechToText } from "../api/apiService";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import { Download } from "lucide-react";

const SpeechToTextDownload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [extractedText, setExtractedText] = useState("");

  const handleFileChange = (event) => setFile(event.target.files[0]);

  const handleConvert = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select an audio file." });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Processing..." });

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const response = await convertSpeechToText(formData);
      const blob = new Blob([response.data], { type: "application/pdf" });
      setDownloadUrl(URL.createObjectURL(blob));

      const extracted = response.headers["x-transcribed-text"];
      if (extracted) {
        setExtractedText(decodeURIComponent(escape(unescape(encodeURIComponent(extracted)))));
      }

      setMessage({ type: "success", text: "Transcription completed!" });
    } catch (error) {
      console.error("STT Error:", error);
      setMessage({ type: "error", text: "Failed to convert speech to text." });
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#FF9C73" }}>
      <Sidebar />
      <motion.div
        className="flex flex-1 justify-center items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="p-6 w-full max-w-xl shadow-lg rounded-2xl"
          style={{ backgroundColor: "#FCF596" }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2
            className="text-2xl font-bold mb-4 text-center"
            style={{ color: "#FF4545" }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Speech-to-Text (Download PDF)
          </motion.h2>

          {message.text && (
            <motion.div
              className={`mb-4 p-3 rounded text-center ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : message.type === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {message.text}
            </motion.div>
          )}

          <div className="mb-4">
            <label className="block font-semibold mb-1 text-[#FF4545]">
              Upload Audio File:
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-black file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#FBD288] file:text-black hover:file:bg-[#FF9C73] cursor-pointer"
            />
          </div>

          <motion.button
            onClick={handleConvert}
            disabled={loading}
            className="w-full py-2 px-4 rounded-md transition disabled:bg-gray-400 mb-2"
            whileHover={{ scale: 1.05 }}
            style={{
              backgroundColor: loading ? "#cccccc" : "#FF4545",
              color: "#fff",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Processing..." : "Convert to PDF"}
          </motion.button>

          {extractedText && (
            <motion.div
              className="mt-4 p-3 bg-white rounded text-gray-800 shadow-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="font-semibold mb-2 text-[#FF4545]">
                Extracted Text:
              </h3>
              <p className="text-sm whitespace-pre-wrap">{extractedText}</p>
            </motion.div>
          )}

          {downloadUrl && (
            <motion.div
              className="mt-4 p-3 bg-green-100 rounded text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-green-700 font-semibold">Transcribed PDF is ready:</p>
              <a href={downloadUrl} download="transcription.pdf">
                <motion.button
                  className="mt-2 text-white py-2 px-4 rounded-md flex items-center gap-2"
                  style={{ backgroundColor: "#FF4545" }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Download size={20} /> Download PDF
                </motion.button>
              </a>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SpeechToTextDownload;
