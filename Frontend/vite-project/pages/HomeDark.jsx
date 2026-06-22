import { useAuth, useUser, UserButton } from "@clerk/clerk-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import api from "../axiosclient";

function Home() {
  const { getToken, isLoaded: authLoaded } = useAuth();
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const isDemo = localStorage.getItem("demoMode") === "true";
const [demoCount, setDemoCount] = useState(
  Number(localStorage.getItem("demoCount")) || 0
);
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deletingDocId, setDeletingDocId] = useState(null);
  
  //delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [docToDelete, setDocToDelete] = useState(null);
const [toast, setToast] = useState("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const chatRef = useRef(null);
  const searchRef = useRef(null);
  const searchDebounceRef = useRef(null);

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoaded && userLoaded && !isSignedIn) {
      navigate("/login");
    }
  }, [authLoaded, userLoaded, isSignedIn, navigate]);

  // ── Token helper ────────────────────────────────────────────────────────────
  const getSafeToken = useCallback(async () => {
    if (!authLoaded || !userLoaded || !isSignedIn) return null;
    try {
      return await getToken();
    } catch {
      return null;
    }
  }, [authLoaded, userLoaded, isSignedIn, getToken]);

  // ── Sync user on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoaded || !userLoaded || !isSignedIn) return;
    const syncUser = async () => {
      const token = await getSafeToken();
      if (!token) return;
      try {
        await api.post("/api/users/sync", {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error("Sync error:", error);
      }
    };
    syncUser();
  }, [authLoaded, userLoaded, isSignedIn, getSafeToken]);

  // ── Fetch documents ─────────────────────────────────────────────────────────
  const fetchDocs = useCallback(async () => {
    const token = await getSafeToken();
    if (!token) return;
    try {
      const res = await api.get("/api/documents", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocuments(res.data || []);
    } catch (err) {
      console.error("Fetch docs error:", err);
    }
  }, [getSafeToken]);

  useEffect(() => {
    if (authLoaded && userLoaded && isSignedIn) fetchDocs();
  }, [authLoaded, userLoaded, isSignedIn, fetchDocs]);

  // ── Load chats for selected doc ─────────────────────────────────────────────
  useEffect(() => {
    if (!selectedDoc) return;
    const loadChats = async () => {
      const token = await getSafeToken();
      if (!token) return;
      try {
        const res = await api.get("/api/chats", {
          params: { documentId: selectedDoc.id },
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data || []);
      } catch (err) {
        console.error("Load chats error:", err);
      }
    };
    loadChats();
  }, [selectedDoc, getSafeToken]);

  // ── Auto-scroll chat ────────────────────────────────────────────────────────
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Close search on outside click ──────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Search chats ────────────────────────────────────────────────────────────
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setSearchOpen(true);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!val.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      const token = await getSafeToken();
      if (!token) return;
      try {
        setSearchLoading(true);
        const res = await api.get("/api/chats/search", {
          params: { query: val.trim() },
          headers: { Authorization: `Bearer ${token}` },
        });
        setSearchResults(res.data || []);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  };

  const handleSearchResultClick = (result) => {
    // Find the matching document and select it
    const doc = documents.find((d) => d.id === result.document_id);
    if (doc) {
      setSelectedDoc(doc);
    }
    setSearchQuery("");
    setSearchOpen(false);
    setSearchResults([]);
  };

  // ── Upload PDF ──────────────────────────────────────────────────────────────
  const uploadFile = async (file) => {
    const token = await getSafeToken();
    if (!token) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post("/api/rag/upload", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("PDF uploaded successfully");
      fetchDocs();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
    // Reset input so same file can be re-uploaded if needed
    e.target.value = "";
  };
//   const handleDeleteDoc = async (e, doc) => {
//   e.stopPropagation(); // prevent selecting the doc when clicking delete
//   if (!window.confirm(`Delete "${doc.title || "Untitled"}"? This cannot be undone.`)) return;

//   const token = await getSafeToken();
//   if (!token) return;

//   try {
//     setDeletingDocId(doc.id);
//     await api.delete(`/api/documents/${doc.id}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     if (selectedDoc?.id === doc.id) {
//       setSelectedDoc(null);
//       setMessages([]);
//     }
//     setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
//   } catch (err) {
//     console.error("Delete doc error:", err);
//     alert("Failed to delete document");
//   } finally {
//     setDeletingDocId(null);
//   }
// };

  // ── Ask question ────────────────────────────────────────────────────────────
  
const handleDeleteDoc = (e, doc) => {
  e.stopPropagation();
  setDocToDelete(doc);
  setShowDeleteModal(true);
};


const confirmDelete = async () => {
  if (!docToDelete) return;

  const token = await getSafeToken();
  if (!token) return;

  try {
    setDeletingDocId(docToDelete.id);

    await api.delete(`/api/documents/${docToDelete.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (selectedDoc?.id === docToDelete.id) {
      setSelectedDoc(null);
      setMessages([]);
    }

    setDocuments((prev) => prev.filter((d) => d.id !== docToDelete.id));

    // ✅ Show success message
    setToast("Document deleted successfully");
    setTimeout(() => setToast(""), 3000);

  } catch (err) {
    console.error("Delete doc error:", err);
    setToast("Failed to delete document");
  } finally {
    setDeletingDocId(null);
    setShowDeleteModal(false);
    setDocToDelete(null);
  }
};




const handleAsk = async () => {
  if (!question.trim()) return;

  // 🔥 DEMO MODE LOGIC
  if (isDemo) {
    if (demoCount >= 3) {
      alert("Demo limit reached. Please sign up to continue.");

      localStorage.removeItem("demoMode");
      localStorage.removeItem("demoCount");

      window.location.href = "/signup";
      return;
    }
  }

  let token = null;

  if (!isDemo) {
    token = await getToken();
  }

  try {
    setLoading(true);

    const userMsg = { role: "user", message: question };
    setMessages((prev) => [...prev, userMsg]);

    const res = await api.post(
      "/api/rag/ask",
      {
        question,
        documentId: isDemo ? null : selectedDoc?.id,
        demo: isDemo, // 🔥 IMPORTANT
      },
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      }
    );

    const aiMsg = {
      role: "ai",
      message: res.data?.answer || "No response",
    };

    setMessages((prev) => [...prev, aiMsg]);
    setQuestion("");

    // 🔥 update demo count
    if (isDemo) {
      const newCount = demoCount + 1;
      setDemoCount(newCount);
      localStorage.setItem("demoCount", newCount);
    }

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  // ── New chat ────────────────────────────────────────────────────────────────
  const handleNewChat = () => {
    setMessages([]);
    setQuestion("");
    setSelectedDoc(null);
  };

  // ── Loading guard ───────────────────────────────────────────────────────────
  if (!authLoaded || !userLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        Loading...
      </div>
    );
  }

  // Redirect handled in useEffect above; show nothing while navigating
  if (!isSignedIn) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-black text-white font-serif">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside
        className={`
          flex flex-col border-r border-white/10 bg-neutral-950
          transition-all duration-300 overflow-hidden flex-shrink-0
          ${sidebarOpen ? "w-[260px]" : "w-0"}
        `}
      >
        <div className="flex flex-col gap-3 px-4 py-6 w-[260px] h-full">
          {/* New Chat */}
          <button
            onClick={handleNewChat}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition"
          >
            + New Chat
          </button>

          {/* Upload */}
          <label className="cursor-pointer rounded-lg border border-dashed border-white/20 px-4 py-2 text-sm text-white/60 hover:border-white/40 text-center transition">
            Upload PDF
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {/* Document List */}
          <div className="mt-2 flex flex-col gap-1 overflow-y-auto flex-1">
            {documents.length === 0 && (
              <p className="text-xs text-white/30 text-center mt-4">
                No documents yet
              </p>
            )}
       
{documents.map((doc) => (
  <div
    key={doc.id}
    className={`
      group flex items-center gap-1 rounded-lg transition
      ${selectedDoc?.id === doc.id ? "bg-white/10" : "hover:bg-white/5"}
    `}
  >
    {/* Doc select button */}
    <button
      onClick={() => setSelectedDoc(doc)}
      className={`
        flex-1 px-3 py-2 text-left text-sm truncate transition
        ${selectedDoc?.id === doc.id ? "text-white" : "text-white/60 hover:text-white"}
      `}
    >
      {doc.title || "Untitled"}
    </button>

    {/* Delete button — visible on hover */}
    <button
      onClick={(e) => handleDeleteDoc(e, doc)}
      disabled={deletingDocId === doc.id}
      title="Delete document"
      className="
        flex-shrink-0 mr-1 p-1.5 rounded-md
        text-white/0 group-hover:text-white/40
        hover:!text-red-400 hover:bg-red-400/10
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-150
      "
    >
      {deletingDocId === doc.id ? (
        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/>
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
        </svg>
      )}
    </button>
  </div>
))}

     </div>

        
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-4 flex-shrink-0 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="text-white/50 hover:text-white transition text-lg flex-shrink-0"
              title="Toggle sidebar"
            >
              ☰
            </button>
            <h1 className="text-sm font-medium text-white/80 truncate">
              {selectedDoc ? selectedDoc.title : "New Chat"}
            </h1>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-xs" ref={searchRef}>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
              {/* Search icon */}
              <svg
                className="w-3.5 h-3.5 text-white/40 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search chats..."
                className="bg-transparent text-sm text-white placeholder-white/30 outline-none flex-1 w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setSearchOpen(false);
                  }}
                  className="text-white/40 hover:text-white transition flex-shrink-0"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchOpen && searchQuery.trim() && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-neutral-900 border border-white/10 rounded-xl overflow-hidden shadow-xl z-50 max-h-72 overflow-y-auto">
                {searchLoading ? (
                  <div className="px-4 py-3 text-sm text-white/40 text-center animate-pulse">
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-white/30 text-center">
                    No results found
                  </div>
                ) : (
                  searchResults.map((result, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearchResultClick(result)}
                      className="w-full text-left px-4 py-3 hover:bg-white/5 transition border-b border-white/5 last:border-0"
                    >
                      <p className="text-sm text-white/80 truncate">
                        {result.message}
                      </p>
                      <p className="text-xs text-white/30 mt-0.5 capitalize">
                        {result.role} · {new Date(result.created_at).toLocaleDateString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <UserButton />
        </header>

        {/* Chat Area */}
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
        >
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-white/20 text-sm">
              {selectedDoc
                ? "Ask anything about this document"
                : "Select or upload a document to get started"}
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`
                  max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                  ${msg.role === "user"
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/90"
                  }
                `}
              >
                {msg.message}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-2xl px-4 py-3 text-sm text-white/50 animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="border-t border-white/10 px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleAsk()}
              placeholder={
                selectedDoc ? "Ask a question..." : "Select a document first"
              }
              disabled={!selectedDoc || loading}
              className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none disabled:opacity-40"
            />
            <button
              onClick={handleAsk}
              disabled={loading || !selectedDoc || !question.trim()}
              className="rounded-lg bg-white px-4 py-1.5 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
