import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import QuestionCard from "../components/QuestionCard";
import { Link } from "react-router-dom";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const questionsRef = collection(db, "questions");
        const snapshot = await getDocs(questionsRef);
        const allQuestions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const lowerQuery = query.toLowerCase();
        const filtered = allQuestions.filter(
          (q) =>
            q.title?.toLowerCase().includes(lowerQuery) ||
            q.description?.toLowerCase().includes(lowerQuery) ||
            q.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)),
        );

        setResults(filtered);
      } catch (error) {
        console.error("Error searching:", error);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Search Results</h1>
        <p className="text-gray-400 mb-8">
          {loading
            ? "Searching..."
            : `Found ${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`}
        </p>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-800/50 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="bg-gray-900 p-12 text-center rounded-xl border border-gray-800">
            <p className="text-gray-400 text-lg mb-4">
              No questions found matching your search
            </p>
            <p className="text-gray-400 mb-6">Try different keywords or</p>
            <Link
              to="/ask"
              className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
            >
              Ask a Question
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((question) => (
              <QuestionCard
                key={question.id}
                question={{
                  id: question.id,
                  title: question.title,
                  excerpt: question.description || question.body,
                  author: {
                    id: question.ownerId || 0,
                    name: question.authorName || question.ownerDisplayName || "Unknown",
                    initials: (question.authorName || question.ownerDisplayName || "??").slice(0, 2).toUpperCase(),
                    color: "bg-blue-500"
                  },
                  tags: question.tags || question.tagResponses?.map(t => t.tagName) || [],
                  time: question.createdAt || question.creationDate || "recently",
                  views: question.viewCount || 0,
                  comments: question.answers || question.comments?.length || 0,
                  score: question.score || 0
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
