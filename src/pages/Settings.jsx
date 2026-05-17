import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, BookOpen, Target, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function Settings() {
  const { courses, addCourse, renameCourse, deleteCourse, weeklyGoalMinutes, setWeeklyGoal, t } = useApp();
  const { user, profile, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const activeStatusVisible = profile?.active_status_visible ?? true;

  const [newCourseName, setNewCourseName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [goalHours, setGoalHours] = useState(() => (weeklyGoalMinutes / 60).toFixed(1));
  const [goalSaved, setGoalSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleAddCourse = async () => {
    if (!newCourseName.trim()) return;
    await addCourse(newCourseName.trim());
    setNewCourseName("");
  };

  const startRename = (course) => {
    setEditingId(course.id);
    setEditingName(course.name);
  };

  const saveRename = async () => {
    if (!editingName.trim()) return;
    await renameCourse(editingId, editingName.trim());
    setEditingId(null);
  };

  const handleGoalSave = async () => {
    const mins = Math.round(parseFloat(goalHours) * 60);
    if (!isNaN(mins) && mins > 0) {
      await setWeeklyGoal(mins);
      setGoalSaved(true);
      setTimeout(() => setGoalSaved(false), 2000);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const uid = user.id;
      await supabase.from("study_session_chats").delete().eq("user_id", uid);
      await supabase.from("study_sessions_log").delete().eq("user_id", uid);
      await supabase.from("study_sessions").delete().eq("user_id", uid);
      await supabase.from("daily_usage").delete().eq("user_id", uid);
      await supabase.from("leaderboard_scores").delete().eq("user_id", uid);
      await supabase.from("friendships").delete().or(`user_id.eq.${uid},friend_id.eq.${uid}`);
      await supabase.from("notifications").delete().eq("user_id", uid);
      await supabase.from("profiles").delete().eq("id", uid);
      await signOut();
      navigate("/");
    } catch (err) {
      setDeleteError(err.message || "Deletion failed. Please try again.");
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-5 pt-2">
      <div>
        <h1 className="text-2xl font-bold text-white">{t.settings}</h1>
        <p className="text-sm text-white/50 mt-0.5">Manage your courses and study goals</p>
      </div>

      {/* Courses */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.2)' }}>
            <BookOpen size={16} style={{ color: '#a78bfa' }} />
          </div>
          <h2 className="text-base font-semibold text-white">{t.courses}</h2>
        </div>

        <div className="space-y-2 mb-4">
          {courses.length === 0 && (
            <p className="text-sm text-white/35 text-center py-4">{t.noCoursesYet}</p>
          )}
          {courses.map((c) => (
            <div key={c.id} className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
              {editingId === c.id ? (
                <>
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveRename();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="flex-1 px-2 py-1 rounded-lg glass-input text-sm"
                  />
                  <button onClick={saveRename} className="p-1.5 rounded-lg transition-colors hover:bg-white/10" style={{ color: '#34d399' }}>
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg text-white/40 hover:bg-white/10 transition-colors">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-white/80">{c.name}</span>
                  <button onClick={() => startRename(c)} className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteCourse(c.id)} className="p-1.5 rounded-lg text-white/30 hover:bg-red-500/20 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
            placeholder="e.g. Object Oriented Programming"
            onKeyDown={(e) => e.key === 'Enter' && handleAddCourse()}
            className="flex-1 px-3 py-2.5 rounded-xl glass-input text-sm"
          />
          <button
            onClick={handleAddCourse}
            disabled={!newCourseName.trim()}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold btn-gold"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Weekly Goal */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,168,0,0.2)' }}>
            <Target size={16} style={{ color: '#F5A800' }} />
          </div>
          <h2 className="text-base font-semibold text-white">{t.weeklyGoal}</h2>
        </div>
        <p className="text-sm text-white/40 mb-4 ml-10">Set a target for hours studied per week</p>
        <div className="flex gap-3 items-center">
          <input
            type="number"
            min="1"
            max="168"
            step="0.5"
            value={goalHours}
            onChange={(e) => setGoalHours(e.target.value)}
            className="w-28 px-3 py-2.5 rounded-xl glass-input text-sm"
          />
          <span className="text-sm text-white/45">{t.hoursPerWeek}</span>
          <button
            onClick={handleGoalSave}
            className="ml-auto px-5 py-2.5 rounded-xl text-sm font-semibold transition-all btn-gold"
            style={goalSaved ? { background: '#34d399', color: '#001a10' } : {}}
          >
            {goalSaved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>
      {/* Privacy */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <Eye size={16} className="text-white/50" />
          </div>
          <h2 className="text-base font-semibold text-white">Privacy</h2>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white/80">Active Status</p>
            <p className="text-xs text-white/35 mt-0.5">Show friends when you're in a study session</p>
          </div>
          <button
            onClick={() => updateProfile({ active_status_visible: !activeStatusVisible })}
            className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
            style={{ background: activeStatusVisible ? '#F5A800' : 'rgba(255,255,255,0.12)' }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
              style={{ left: activeStatusVisible ? '22px' : '2px' }}
            />
          </button>
        </div>
      </div>
      {/* Divider */}
      <div className="h-px" style={{ background: "rgba(255,255,255,0.07)" }} />

      {/* Danger Zone */}
      <div
        className="rounded-xl p-4"
        style={{
          background: "rgba(220,38,38,0.05)",
          border: "1px solid rgba(220,38,38,0.2)",
        }}
      >
        <h2 className="text-base font-semibold mb-1" style={{ color: "#ef4444" }}>
          Delete Account
        </h2>
        <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>
          Permanently delete your account and all your data. This cannot be undone.
        </p>
        <button
          onClick={() => { setDeleteError(""); setShowDeleteModal(true); }}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-red-500 hover:text-white"
          style={{ border: "1px solid #ef4444", color: "#ef4444", background: "transparent" }}
        >
          Delete My Account
        </button>
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(10,26,14,0.9))",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <h3 className="text-lg font-semibold text-white mb-3">Are you sure?</h3>
            <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>
              This will permanently delete your account, all study sessions, chat history, and progress. This cannot be undone.
            </p>
            {deleteError && (
              <p
                className="text-sm text-red-300 px-3 py-2 rounded-lg mb-4"
                style={{ background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.3)" }}
              >
                {deleteError}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium btn-ghost disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                style={{ background: "#ef4444" }}
              >
                {deleteLoading ? "Deleting…" : "Yes, Delete My Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
