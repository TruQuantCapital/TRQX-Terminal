import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BookOpen,
  Clock3,
  Flame,
  GraduationCap,
  RefreshCw,
  Search,
  ShieldCheck,
  UserX,
  Users,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { courseLevels } from "../data/courseLevels";
import "../styles/admin.css";

const TIER_ORDER = ["free", "starter", "pro", "elite"];

function formatDate(value) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function relativeDate(value) {
  if (!value) return "Never";
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Unknown";

  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return formatDate(value);
}

function tierClass(tier) {
  return `admin-tier admin-tier-${String(tier || "free").toLowerCase()}`;
}

function parseLessonRef(value) {
  if (!value || !String(value).includes(":")) return null;
  const [levelKey, rawIndex] = String(value).split(":");
  const lessonIndex = Number(rawIndex);
  if (!Number.isInteger(lessonIndex)) return null;
  return { levelKey, lessonIndex };
}

function lessonTitle(value) {
  const parsed = parseLessonRef(value);
  if (!parsed) return value || "Not started";

  const level = courseLevels.find((item) => item.key === parsed.levelKey);
  const lesson = level?.lessons?.[parsed.lessonIndex];
  return lesson?.title || `${parsed.levelKey} lesson ${parsed.lessonIndex + 1}`;
}

function StatCard({ icon: Icon, label, value, detail }) {
  return (
    <article className="admin-stat-card">
      <div className="admin-stat-icon"><Icon size={20} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

export default function AdminPage() {
  const totalLessons = useMemo(
    () => courseLevels.reduce((sum, level) => sum + level.lessons.length, 0),
    []
  );

  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState([]);
  const [query, setQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("last_activity");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError("");

    const [studentsResult, summaryResult, activityResult] = await Promise.all([
      supabase.rpc("get_admin_students"),
      supabase.rpc("get_admin_academy_summary"),
      supabase.rpc("get_admin_activity_feed", { result_limit: 25 }),
    ]);

    const firstError =
      studentsResult.error || summaryResult.error || activityResult.error;

    if (firstError) {
      setError(firstError.message || "Unable to load admin data.");
      setStudents([]);
      setSummary(null);
      setActivity([]);
      setLoading(false);
      return;
    }

    setStudents(studentsResult.data || []);
    setSummary(summaryResult.data?.[0] || null);
    setActivity(activityResult.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  async function openStudent(student) {
    setSelectedStudent(student);
    setDetailsLoading(true);
    setStudentDetails([]);

    const { data, error: detailError } = await supabase.rpc(
      "get_admin_student_progress",
      { target_user_id: student.user_id }
    );

    if (detailError) setError(detailError.message);
    else setStudentDetails(data || []);

    setDetailsLoading(false);
  }

  const filteredStudents = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const now = Date.now();

    const rows = students.filter((student) => {
      const currentTitle = lessonTitle(student.current_lesson);
      const matchesSearch =
        !normalized ||
        String(student.email || "").toLowerCase().includes(normalized) ||
        String(student.full_name || "").toLowerCase().includes(normalized) ||
        currentTitle.toLowerCase().includes(normalized);

      const matchesTier =
        tierFilter === "all" ||
        String(student.tier || "free").toLowerCase() === tierFilter;

      const lastActivity = student.last_activity
        ? new Date(student.last_activity).getTime()
        : 0;
      const daysInactive = lastActivity
        ? (now - lastActivity) / 86_400_000
        : Number.POSITIVE_INFINITY;

      const matchesActivity =
        activityFilter === "all" ||
        (activityFilter === "active7" && daysInactive <= 7) ||
        (activityFilter === "inactive7" && daysInactive > 7) ||
        (activityFilter === "inactive30" && daysInactive > 30);

      return matchesSearch && matchesTier && matchesActivity;
    });

    return [...rows].sort((a, b) => {
      if (sortBy === "progress") {
        return Number(b.completed_lessons || 0) - Number(a.completed_lessons || 0);
      }
      if (sortBy === "streak") {
        return Number(b.study_streak || 0) - Number(a.study_streak || 0);
      }
      if (sortBy === "email") {
        return String(a.email || "").localeCompare(String(b.email || ""));
      }
      return (
        new Date(b.last_activity || 0).getTime() -
        new Date(a.last_activity || 0).getTime()
      );
    });
  }, [students, query, tierFilter, activityFilter, sortBy]);

  const averageCompletion = Number(summary?.average_completed_lessons || 0);

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p>OWNER ACCESS</p>
          <h1>TRQX Admin Intelligence</h1>
          <span>Member progress, engagement, inactivity, and recent Academy activity.</span>
        </div>
        <button className="admin-refresh" onClick={loadAdminData} disabled={loading}>
          <RefreshCw size={17} className={loading ? "admin-spin" : ""} />
          Refresh
        </button>
      </header>

      {error && (
        <div className="admin-error">
          <ShieldCheck size={18} />
          <div>
            <strong>Admin data could not be loaded.</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      <section className="admin-stats admin-stats-six">
        <StatCard icon={Users} label="Total Members" value={Number(summary?.total_members || students.length).toLocaleString("en-US")} detail={`${Number(summary?.elite_members || 0)} Elite members`} />
        <StatCard icon={Activity} label="Active Today" value={Number(summary?.active_today || 0).toLocaleString("en-US")} detail={`${Number(summary?.active_last_7_days || 0)} active in 7 days`} />
        <StatCard icon={UserX} label="Inactive 7+ Days" value={Number(summary?.inactive_7_days || 0).toLocaleString("en-US")} detail="Follow-up candidates" />
        <StatCard icon={Clock3} label="Inactive 30+ Days" value={Number(summary?.inactive_30_days || 0).toLocaleString("en-US")} detail="Retention risk" />
        <StatCard icon={BookOpen} label="Lessons Today" value={Number(summary?.lessons_completed_today || 0).toLocaleString("en-US")} detail="Completed since midnight" />
        <StatCard icon={GraduationCap} label="Average Progress" value={totalLessons ? `${Math.round((averageCompletion / totalLessons) * 100)}%` : "0%"} detail={`${averageCompletion.toFixed(1)} of ${totalLessons} lessons`} />
      </section>

      <section className="admin-tier-grid">
        {TIER_ORDER.map((tier) => (
          <div key={tier} className="admin-tier-card">
            <span className={tierClass(tier)}>{tier}</span>
            <strong>{Number(summary?.[`${tier}_members`] || 0).toLocaleString("en-US")}</strong>
            <small>members</small>
          </div>
        ))}
      </section>

      <section className="admin-phase2-grid">
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Student Management</h2>
              <span>{filteredStudents.length} matching members</span>
            </div>
          </div>

          <div className="admin-filters">
            <label className="admin-search">
              <Search size={17} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search email, name, or lesson..." />
            </label>
            <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}>
              <option value="all">All tiers</option>
              {TIER_ORDER.map((tier) => <option key={tier} value={tier}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</option>)}
            </select>
            <select value={activityFilter} onChange={(e) => setActivityFilter(e.target.value)}>
              <option value="all">All activity</option>
              <option value="active7">Active within 7 days</option>
              <option value="inactive7">Inactive over 7 days</option>
              <option value="inactive30">Inactive over 30 days</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="last_activity">Sort: Recent activity</option>
              <option value="progress">Sort: Progress</option>
              <option value="streak">Sort: Streak</option>
              <option value="email">Sort: Email</option>
            </select>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Member</th><th>Tier</th><th>Progress</th><th>Current Lesson</th><th>Last Active</th><th>Streak</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="admin-empty">Loading members...</td></tr>
                ) : filteredStudents.length === 0 ? (
                  <tr><td colSpan="6" className="admin-empty">No members match the current filters.</td></tr>
                ) : filteredStudents.map((student) => {
                  const completed = Number(student.completed_lessons || 0);
                  const percent = totalLessons ? Math.min(100, Math.round((completed / totalLessons) * 100)) : 0;
                  return (
                    <tr key={student.user_id} onClick={() => openStudent(student)}>
                      <td><strong>{student.full_name || "TRQX Member"}</strong><span>{student.email || "No email stored"}</span></td>
                      <td><span className={tierClass(student.tier)}>{student.tier || "free"}</span></td>
                      <td><div className="admin-progress-row"><div><i style={{ width: `${percent}%` }} /></div><strong>{percent}%</strong></div><small>{completed} / {totalLessons} lessons</small></td>
                      <td>{lessonTitle(student.current_lesson)}</td>
                      <td title={formatDate(student.last_activity)}>{relativeDate(student.last_activity)}</td>
                      <td><span className="admin-streak"><Flame size={15} /> {Number(student.study_streak || 0)}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="admin-activity-panel">
          <div className="admin-panel-heading">
            <div><h2>Recent Activity</h2><span>Latest Academy completions</span></div>
          </div>
          <div className="admin-activity-list">
            {activity.length === 0 ? (
              <p className="admin-empty">No recent activity.</p>
            ) : activity.map((item, index) => (
              <article key={`${item.user_id}-${item.lesson_ref}-${index}`}>
                <div className="admin-activity-dot" />
                <div>
                  <strong>{item.full_name || item.email || "TRQX Member"}</strong>
                  <span>Completed {lessonTitle(item.lesson_ref)}</span>
                  <small>{relativeDate(item.completed_at)}</small>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </section>

      {selectedStudent && (
        <div className="admin-modal-backdrop" onMouseDown={() => setSelectedStudent(null)}>
          <section className="admin-modal" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div><p>STUDENT PROFILE</p><h2>{selectedStudent.full_name || selectedStudent.email}</h2><span>{selectedStudent.email}</span></div>
              <button onClick={() => setSelectedStudent(null)}>×</button>
            </header>
            <div className="admin-modal-summary">
              <div><span>Tier</span><strong className={tierClass(selectedStudent.tier)}>{selectedStudent.tier || "free"}</strong></div>
              <div><span>Completed</span><strong>{selectedStudent.completed_lessons || 0} / {totalLessons}</strong></div>
              <div><span>Current lesson</span><strong>{lessonTitle(selectedStudent.current_lesson)}</strong></div>
              <div><span>Last active</span><strong>{formatDate(selectedStudent.last_activity)}</strong></div>
              <div><span>Study streak</span><strong>{selectedStudent.study_streak || 0} days</strong></div>
              <div><span>Total minutes</span><strong>{selectedStudent.total_minutes || 0}</strong></div>
            </div>
            <div className="admin-detail-list">
              <h3>Lesson Progress</h3>
              {detailsLoading ? <p>Loading lesson history...</p> : studentDetails.length === 0 ? <p>No completed lessons have been recorded.</p> : studentDetails.map((row) => (
                <article key={row.lesson_id}>
                  <div><strong>{lessonTitle(row.lesson_id)}</strong><span>Completed {formatDate(row.completed_at)}</span></div>
                  <div><span>Quiz</span><strong>{row.quiz_score == null ? "—" : `${row.quiz_score}%`}</strong></div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
