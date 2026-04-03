import { useEffect, useMemo, useState } from "react";
import "./App.css";
// import { useNavigate } from "react-router-dom";
// import { Route, Routes } from "react-router-dom";
// import Submitted from "./component/Submitted";

const API_BASE = "https://scms-bknd.onrender.com";
const FILE_BASE = API_BASE.replace(/\/api$/, "");

const initialRegisterState = {
  name: "",
  email: "",
  password: "",
  role: "STUDENT",
  rollNo: "",
  dept: "",
  year: "",
  section: "",
  campusCode: "",
};

const initialAssignmentState = {
  title: "",
  description: "",
  subject: "",
  dept: "",
  year: "",
  section: "",
  dueDate: "",
};

const initialAttendanceState = {
  dept: "",
  year: "",
  section: "",
  subject: "",
  durationMinuts: 5,
};

function formatDate(dateValue) {
  if (!dateValue) return "-";
  try {
    return new Date(dateValue).toLocaleString();
  } catch {
    return dateValue;
  }
}

function formatShortDate(dateValue) {
  if (!dateValue) return "-";
  try {
    return new Date(dateValue).toLocaleDateString();
  } catch {
    return dateValue;
  }
}

function getStatusBadgeClass(status) {
  if (
    ["SUBMITTED", "RESUBMITTED", "ACTIVE", "APPROVED", "PRESENT"].includes(
      status,
    )
  )
    return "badge success";
  if (["LATE", "RESUBMITTED_LATE", "PENDING"].includes(status))
    return "badge warning";
  if (["REJECTED", "INACTIVE"].includes(status)) return "badge danger";
  return "badge";
}

async function apiRequest(
  path,
  { method = "GET", token, body, isFormData = false } = {},
) {
  const headers = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

function SectionCard({ title, subtitle, action, children }) {
  return (
    <section className="dashboard-card">
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    campusCode: "",
  });
  const [registerForm, setRegisterForm] = useState(initialRegisterState);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: loginForm,
      });
      onAuthSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSubmitted(true);
    setError("");
    try {
      const payload = {
        ...registerForm,
        campusCode:
          registerForm.role === "ADMIN" ? "" : registerForm.campusCode,
        rollNo: registerForm.role === "STUDENT" ? registerForm.rollNo : "",
        dept: registerForm.role === "ADMIN" ? "" : registerForm.dept,
        year: registerForm.role === "ADMIN" ? "" : registerForm.year,
        section: registerForm.role === "ADMIN" ? "" : registerForm.section,
      };
      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: payload,
      });
      // if (!data) {
      //   alert("There's an error running out right now, Try again sometime");
      // } else {
      //   navigate("/submitted");
      // }
      onAuthSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card intro-card">
        <p className="eyebrow">Smart Campus Management System</p>
        <h1>Campus-secured attendance, assignments and approvals</h1>
        <p>
          The portal now supports campus code based onboarding, admin approvals,
          faculty leave, student assignment resubmission and attendance
          tracking.
        </p>
        <div className="feature-grid">
          <div className="feature-box">
            <strong>Admin</strong>
            <span>
              Create a campus, approve faculty, manage announcements and track
              faculty attendance.
            </span>
          </div>
          <div className="feature-box">
            <strong>Faculty</strong>
            <span>
              Approve students, create assignments, review submissions and
              request leave.
            </span>
          </div>
          <div className="feature-box">
            <strong>Student</strong>
            <span>
              Join via campus code, mark attendance, submit or re-submit
              assignments, and track your records.
            </span>
          </div>
        </div>
      </div>

      <div className="auth-card form-card">
        <div className="tab-switcher">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        {error ? <div className="alert error">{error}</div> : null}

        {mode === "login" ? (
          <form className="form-grid" onSubmit={handleLogin}>
            <label>
              Email
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                required
              />
            </label>
            <label className="full-width">
              Campus Code {`(required for faculty/student, optional for admin)`}
              <input
                type="text"
                value={loginForm.campusCode}
                onChange={(e) =>
                  setLoginForm({
                    ...loginForm,
                    campusCode: e.target.value.toUpperCase(),
                  })
                }
                placeholder="Example: A1B2C3"
              />
            </label>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Please wait..." : "Login"}
            </button>
          </form>
        ) : !submitted ? (
          <form className="form-grid" onSubmit={handleRegister}>
            <label>
              Full Name
              <input
                type="text"
                value={registerForm.name}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, name: e.target.value })
                }
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, email: e.target.value })
                }
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, password: e.target.value })
                }
                required
              />
            </label>
            <label>
              Role
              <select
                value={registerForm.role}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, role: e.target.value })
                }
              >
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>

            {registerForm.role !== "ADMIN" ? (
              <label className="full-width">
                Campus Code
                <input
                  type="text"
                  value={registerForm.campusCode}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      campusCode: e.target.value.toUpperCase(),
                    })
                  }
                  required
                />
              </label>
            ) : null}

            {registerForm.role !== "ADMIN" ? (
              <label>
                Campus Code
                <input
                  type="text"
                  value={registerForm.campusCode}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      campusCode: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="Enter admin campus code"
                  required
                />
              </label>
            ) : null}

            {registerForm.role === "STUDENT" ? (
              <label>
                Roll Number
                <input
                  type="text"
                  value={registerForm.rollNo}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, rollNo: e.target.value })
                  }
                  required
                />
              </label>
            ) : null}

            {registerForm.role !== "ADMIN" ? (
              <>
                <label>
                  Department
                  <input
                    type="text"
                    value={registerForm.dept}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, dept: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  Year
                  <input
                    type="text"
                    value={registerForm.year}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, year: e.target.value })
                    }
                    required={registerForm.role === "STUDENT"}
                  />
                </label>
                <label>
                  Section
                  <input
                    type="text"
                    value={registerForm.section}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        section: e.target.value,
                      })
                    }
                    required
                  />
                </label>
              </>
            ) : null}
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Please wait..." : "Create Account"}
            </button>
          </form>
        ) : (
          <div className="bg-[#10182a] text-on-surface min-h-screen flex flex-col items-center">
            <header className="w-full pt-8 px-8 bg-[#10182a]">
              <nav className="flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="text-white font-['Manrope'] font-bold text-xl">
                  Editorial Serenity
                </div>
                <div className="hidden md:flex items-center gap-8">
                  <button className="material-symbols-outlined text-slate-400 hover:text-[#22C55E] transition-colors duration-300 active:opacity-80">
                    close
                  </button>
                </div>
              </nav>
            </header>
            <main className="flex-grow flex items-center justify-center w-full px-6 pt-24 pb-32">
              <section className="max-w-2xl w-full flex flex-col items-center text-center">
                <div className="relative mb-12">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150"></div>
                  <div className="relative w-32 h-32 flex items-center justify-center bg-primary rounded-full editorial-shadow group animate-check">
                    <span
                      className="material-symbols-outlined text-white text-6xl leading-none transition-transform duration-500 group-hover:scale-110"
                      style="font-variation-settings: 'wght' 600;"
                    >
                      check
                    </span>
                  </div>
                </div>

                <div className="space-y-6 max-w-lg mx-auto">
                  <h1 className="font-headline font-extrabold text-[3.5rem] leading-[1.1] tracking-tight text-white">
                    Request Submitted
                  </h1>
                  <p className="font-body text-lg leading-[1.6] text-slate-300">
                    Your request has been received and is currently being
                    processed by our team. We've sent a detailed summary to your
                    registered email.
                  </p>
                </div>
                <div className="mt-16 w-full max-w-md bg-white/5 backdrop-blur-sm p-8 rounded-3xl space-y-8 editorial-shadow text-left border border-white/10">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-xl">
                        description
                      </span>
                    </div>
                    <div>
                      <p className="font-label text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Status
                      </p>
                      <p className="font-body font-semibold text-white">
                        Processing Queue
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-xl">
                        schedule
                      </span>
                    </div>
                    <div>
                      <p className="font-label text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Expected Update
                      </p>
                      <p className="font-body font-semibold text-white">
                        Within 24-48 hours
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-16 w-full max-w-xs">
                    <button className="w-full bg-[#22C55E] text-white py-5 px-8 rounded-3xl font-headline font-bold text-lg editorial-shadow transition-all duration-300 hover:brightness-110 hover:-translate-y-1 active:scale-95 active:opacity-90">
                      Done
                    </button>
                </div>

                <div className="absolute -bottom-10 -left-20 w-96 h-96 opacity-10 pointer-events-none">
                  <img
                    className="w-full h-full object-contain invert opacity-20"
                    data-alt="abstract architectural forms with soft curves and clean lines in minimal white studio lighting"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfbiDjA8d3YziKksE8QQydr_944RklSFwA8sOHDCPyqzSPKe1lM5g1nQM7ibtfvmfipMH6D8EiiAnCXMxfOs973EkLqy_KGCfF5JTA38sbUEUjYPHPRpDTsVhAktpWzvtFqrXrmjEF5UjpY7WROCG23Lg9aF8gvMEa45I_ZHkXTUwpwFwmmxic_I8nLO7kcLyflCkNHolFMmhkWucZt4I5C7HHw1dxTfFOYb0G2XYrQZbhr6VP7SWPxBhIY-eBd4eW2p7Pt02rsQM"
                  />
                </div>
              </section>
            </main>
            <footer className="w-full py-12 px-8 flex justify-center border-t border-white/5">
              <p className="font-body text-sm text-slate-500">
                © 2024 Editorial Serenity. All rights reserved.
              </p>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCards({ cards }) {
  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <div key={card.label} className="stat-card">
          <span>{card.label}</span>
          <strong>{card.value}</strong>
        </div>
      ))}
    </div>
  );
}

function AnnouncementsPanel({ token, title = "Announcements" }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/announcements", { token });
      setAnnouncements(data.announcements || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <SectionCard
      title={title}
      subtitle="Campus notices visible based on your role."
      action={
        <button className="secondary-btn" onClick={load}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      }
    >
      <div className="card-list">
        {announcements.length === 0 ? (
          <div className="empty-state">No announcements yet.</div>
        ) : (
          announcements.map((item) => (
            <article key={item._id} className="item-card">
              <div className="item-top">
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.createdBy?.name || "Admin"}</p>
                </div>
                <span className="badge">{item.audience}</span>
              </div>
              <p className="description-text">{item.message}</p>
              <div className="meta-grid">
                <span>
                  <strong>Posted:</strong> {formatDate(item.createdAt)}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </SectionCard>
  );
}

function TodayLeaves({ token }) {
  const [leaves, setLeaves] = useState([]);
  const load = async () => {
    try {
      const data = await apiRequest("/faculty/today-leaves", { token });
      setLeaves(data.leaves || []);
    } catch {
      setLeaves([]);
    }
  };
  useEffect(() => {
    load();
  }, []);

  return (
    <SectionCard
      title="Today Faculty Leave"
      subtitle="Approved faculty leave for today."
    >
      {leaves.length === 0 ? (
        <div className="empty-state">No approved faculty leave for today.</div>
      ) : (
        <div className="card-list">
          {leaves.map((item) => (
            <article key={item._id} className="item-card">
              <div className="item-top">
                <div>
                  <h3>{item.facultyId?.name || "-"}</h3>
                  <p>{item.facultyId?.dept || "-"}</p>
                </div>
                <span className="badge success">ON LEAVE</span>
              </div>
              <p className="description-text">
                {item.reason || "No reason shared."}
              </p>
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function StudentPanel({ token, user, setToast }) {
  const [assignments, setAssignments] = useState([]);
  const [attendanceCode, setAttendanceCode] = useState("");
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState("");
  const [comments, setComments] = useState({});
  const [files, setFiles] = useState({});
  // const [attendanceSummary, setAttendanceSummary] = useState(null)
  // const [announcements, setAnnouncements] = useState([])
  // const [todayLeaves, setTodayLeaves] = useState([])

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/assignments", { token });
      setAssignments(data.assignments || []);
    } catch (error) {
      setToast({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceSummary = async () => {
    try {
      const data = await apiRequest("/attendance/student/me", { token });
      setAttendanceSummary(data.bySubject || []);
    } catch {
      setAttendanceSummary([]);
    }
  };

  useEffect(() => {
    loadAssignments();
    loadAttendanceSummary();
  }, []);

  const markAttendance = async (event) => {
    event.preventDefault();
    try {
      const data = await apiRequest("/attendance/mark", {
        method: "POST",
        token,
        body: { sessionCode: attendanceCode },
      });
      setToast({
        type: "success",
        message: data.message || "Attendance marked",
      });
      setAttendanceCode("");
      loadAttendanceSummary();
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  };

  const submitAssignment = async (assignmentId) => {
    const selectedFile = files[assignmentId];
    if (!selectedFile) {
      setToast({
        type: "error",
        message: "Please select a file before submitting.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("comment", comments[assignmentId] || "");

    try {
      setSubmittingId(assignmentId);
      const data = await apiRequest(`/assignments/${assignmentId}/submit`, {
        method: "POST",
        token,
        body: formData,
        isFormData: true,
      });
      setToast({
        type: "success",
        message: data.message || "Assignment submitted successfully.",
      });
      await loadAssignments();
    } catch (error) {
      setToast({ type: "error", message: error.message });
    } finally {
      setSubmittingId("");
    }
  };

  const cards = useMemo(() => {
    const submittedCount = assignments.filter(
      (item) => item.mySubmission,
    ).length;
    return [
      { label: "Assignments Available", value: assignments.length },
      { label: "Assignments Submitted", value: submittedCount },
      { label: "Attendance Subjects", value: attendanceSummary.length },
      { label: "Logged in as", value: user.role },
    ];
  }, [assignments, attendanceSummary, user.role]);

  return (
    <div className="panel-space">
      <SummaryCards cards={cards} />

      <div className="two-column-grid">
        <SectionCard
          title="Mark Class Attendance"
          subtitle="Enter the session code shared by faculty."
        >
          <form className="form-grid" onSubmit={markAttendance}>
            <label className="full-width">
              Session Code
              <input
                value={attendanceCode}
                onChange={(e) => setAttendanceCode(e.target.value)}
                placeholder="Enter session code"
                required
              />
            </label>
            <button className="primary-btn" type="submit">
              Mark Present
            </button>
          </form>
        </SectionCard>

        <SectionCard
          title="My Attendance Summary"
          subtitle="Track your attendance class by class."
        >
          <div className="table-wrap compact-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Present Count</th>
                </tr>
              </thead>
              <tbody>
                {attendanceSummary.length === 0 ? (
                  <tr>
                    <td colSpan="2">No attendance marked yet.</td>
                  </tr>
                ) : (
                  attendanceSummary.map((item) => (
                    <tr key={item.subject}>
                      <td>{item.subject}</td>
                      <td>{item.presentCount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <TodayLeaves token={token} />
      <AnnouncementsPanel token={token} />

      <SectionCard
        title="My Assignments"
        subtitle={`Targeted for ${user.dept} - Year ${user.year} - Section ${user.section}`}
        action={
          <button
            className="secondary-btn"
            onClick={loadAssignments}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        }
      >
        <div className="card-list">
          {assignments.length === 0 ? (
            <div className="empty-state">
              No assignments available right now.
            </div>
          ) : (
            assignments.map((assignment) => {
              const submission = assignment.mySubmission;
              const alreadySubmitted = Boolean(submission);
              const allowResubmit = submission?.status === "REJECTED";
              return (
                <article key={assignment._id} className="item-card">
                  <div className="item-top">
                    <div>
                      <h3>{assignment.title}</h3>
                      <p>{assignment.subject}</p>
                    </div>
                    <span
                      className={
                        alreadySubmitted
                          ? getStatusBadgeClass(submission.status)
                          : "badge"
                      }
                    >
                      {alreadySubmitted ? submission.status : "PENDING"}
                    </span>
                  </div>
                  <div className="meta-grid">
                    <span>
                      <strong>Faculty:</strong>{" "}
                      {assignment.createdBy?.name || "-"}
                    </span>
                    <span>
                      <strong>Due:</strong> {formatDate(assignment.dueDate)}
                    </span>
                    <span>
                      <strong>Department:</strong> {assignment.dept}
                    </span>
                    <span>
                      <strong>Section:</strong> {assignment.section}
                    </span>
                  </div>
                  <p className="description-text">
                    {assignment.description || "No description provided."}
                  </p>
                  {assignment.attachmentUrl ? (
                    <a
                      className="text-link"
                      href={`${FILE_BASE}${assignment.attachmentUrl}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View assignment attachment
                    </a>
                  ) : null}
                  {alreadySubmitted && !allowResubmit ? (
                    <div className="submission-box submitted-box">
                      <p>
                        <strong>Submitted on:</strong>{" "}
                        {formatDate(submission.submittedAt)}
                      </p>
                      {submission.comment ? (
                        <p>
                          <strong>Comment:</strong> {submission.comment}
                        </p>
                      ) : null}
                      {submission.facultyRemark ? (
                        <p>
                          <strong>Faculty Remark:</strong>{" "}
                          {submission.facultyRemark}
                        </p>
                      ) : null}
                      <a
                        className="text-link"
                        href={`${FILE_BASE}${submission.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open submitted file
                      </a>
                    </div>
                  ) : (
                    <div className="submission-box">
                      {allowResubmit ? (
                        <div className="alert error">
                          Faculty rejected this submission.{" "}
                          {submission.facultyRemark ||
                            "Please re-submit with corrections."}
                        </div>
                      ) : null}
                      <label>
                        Comment
                        <textarea
                          rows="3"
                          value={comments[assignment._id] || ""}
                          onChange={(e) =>
                            setComments({
                              ...comments,
                              [assignment._id]: e.target.value,
                            })
                          }
                          placeholder="Add a note for faculty (optional)"
                        />
                      </label>
                      <label>
                        Upload File
                        <input
                          type="file"
                          onChange={(e) =>
                            setFiles({
                              ...files,
                              [assignment._id]: e.target.files?.[0] || null,
                            })
                          }
                          accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg,.ppt,.pptx"
                        />
                      </label>
                      <button
                        className="primary-btn"
                        type="button"
                        disabled={submittingId === assignment._id}
                        onClick={() => submitAssignment(assignment._id)}
                      >
                        {submittingId === assignment._id
                          ? "Submitting..."
                          : allowResubmit
                            ? "Re-submit Assignment"
                            : "Submit Assignment"}
                      </button>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function FacultyPanel({ token, user, setToast }) {
  const [assignmentForm, setAssignmentForm] = useState({
    ...initialAssignmentState,
    dept: user.dept || "",
    year: user.year || "",
    section: user.section || "",
  });
  const [assignmentAttachment, setAssignmentAttachment] = useState(null);
  const [attendanceForm, setAttendanceForm] = useState({
    ...initialAttendanceState,
    dept: user.dept || "",
    year: user.year || "",
    section: user.section || "",
  });
  const [facultyAssignments, setFacultyAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [report, setReport] = useState(null);
  const [submissionsView, setSubmissionsView] = useState(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  // const [reviewRemarks, setReviewRemarks] = useState({})
  // const [attendanceSummary, setAttendanceSummary] = useState(null)
  const [leaveForm, setLeaveForm] = useState({ leaveDate: "", reason: "" });
  const [myLeaves, setMyLeaves] = useState([]);
  // const [announcements, setAnnouncements] = useState([])
  const [pendingStudents, setPendingStudents] = useState([]);
  // const [leaveForm, setLeaveForm] = useState({ leaveDate: '', reason: '' })
  // const [myLeaves, setMyLeaves] = useState([])
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [reviewForm, setReviewForm] = useState({});

  const loadFacultyAssignments = async () => {
    setLoadingAssignments(true);
    try {
      const data = await apiRequest("/assignments/faculty/mine", { token });
      setFacultyAssignments(data.assignments || []);
    } catch (error) {
      setToast({ type: "error", message: error.message });
    } finally {
      setLoadingAssignments(false);
    }
  };

  const loadPendingStudents = async () => {
    try {
      const data = await apiRequest("/faculty/students/pending", { token });
      setPendingStudents(data.students || []);
    } catch {
      setPendingStudents([]);
    }
  };

  const loadLeaves = async () => {
    try {
      const data = await apiRequest("/faculty/leave", { token });
      setMyLeaves(data.leaves || []);
    } catch {
      setMyLeaves([]);
    }
  };

  const loadStudentAttendance = async () => {
    try {
      const data = await apiRequest("/faculty/attendance/students", { token });
      setStudentAttendance(data.students || []);
    } catch {
      setStudentAttendance([]);
    }
  };

  useEffect(() => {
    loadFacultyAssignments();
    loadPendingStudents();
    loadLeaves();
    loadStudentAttendance();
  }, []);

  const createAssignment = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(assignmentForm).forEach(([key, value]) =>
        formData.append(key, value),
      );
      if (assignmentAttachment)
        formData.append("attachment", assignmentAttachment);
      const data = await apiRequest("/assignments", {
        method: "POST",
        token,
        body: formData,
        isFormData: true,
      });
      setToast({
        type: "success",
        message: data.message || "Assignment created",
      });
      setAssignmentForm({
        ...initialAssignmentState,
        dept: user.dept || "",
        year: user.year || "",
        section: user.section || "",
      });
      setAssignmentAttachment(null);
      await loadFacultyAssignments();
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  };

  const createAttendanceSession = async (event) => {
    event.preventDefault();
    try {
      const data = await apiRequest("/attendance/session", {
        method: "POST",
        token,
        body: attendanceForm,
      });
      setActiveSession(data.session);
      setReport(null);
      setToast({
        type: "success",
        message: "Attendance session created successfully.",
      });
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  };

  const getReport = async () => {
    if (!activeSession?.id) return;
    try {
      const data = await apiRequest(
        `/attendance/session/${activeSession.id}/report`,
        { token },
      );
      setReport(data);
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  };

  const closeSession = async () => {
    if (!activeSession?.id) return;
    try {
      const data = await apiRequest(
        `/attendance/session/${activeSession.id}/close`,
        { method: "POST", token },
      );
      setToast({ type: "success", message: data.message || "Session closed" });
      setActiveSession((prev) => (prev ? { ...prev, isActive: false } : null));
      loadStudentAttendance();
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  };

  const viewSubmissions = async (assignmentId) => {
    try {
      const data = await apiRequest(
        `/assignments/${assignmentId}/submissions`,
        { token },
      );
      setSelectedAssignmentId(assignmentId);
      setSubmissionsView(data);
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  };

  const reviewSubmission = async (assignmentId, submissionId) => {
    const current = reviewForm[submissionId] || {
      status: "REJECTED",
      facultyRemark: "",
    };
    try {
      const data = await apiRequest(
        `/assignments/${assignmentId}/submissions/${submissionId}/review`,
        {
          method: "POST",
          token,
          body: current,
        },
      );
      setToast({
        type: "success",
        message: data.message || "Submission reviewed",
      });
      viewSubmissions(assignmentId);
      loadFacultyAssignments();
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  };

  const approveStudent = async (studentId, status) => {
    try {
      await apiRequest(`/faculty/students/${studentId}/approval`, {
        method: "POST",
        token,
        body: { status },
      });
      setToast({ type: "success", message: `Student ${status.toLowerCase()}` });
      loadPendingStudents();
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  };

  const submitLeave = async (event) => {
    event.preventDefault();
    try {
      const data = await apiRequest("/faculty/leave", {
        method: "POST",
        token,
        body: leaveForm,
      });
      setToast({
        type: "success",
        message: data.message || "Leave request submitted",
      });
      setLeaveForm({ leaveDate: "", reason: "" });
      loadLeaves();
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  };

  const selectedAssignment = useMemo(
    () => facultyAssignments.find((item) => item._id === selectedAssignmentId),
    [facultyAssignments, selectedAssignmentId],
  );

  const cards = [
    { label: "Assignments Published", value: facultyAssignments.length },
    { label: "Pending Student Approvals", value: pendingStudents.length },
    { label: "Live Attendance Session", value: activeSession ? "Yes" : "No" },
    { label: "Logged in as", value: user.role },
  ];

  return (
    <div className="panel-space">
      <SummaryCards cards={cards} />
      <AnnouncementsPanel token={token} />
      <TodayLeaves token={token} />

      <div className="two-column-grid">
        <SectionCard
          title="Create Attendance Session"
          subtitle="Generate a session code for live classroom attendance."
        >
          <form className="form-grid" onSubmit={createAttendanceSession}>
            <label>
              <span>Department</span>
              <input
                value={attendanceForm.dept}
                onChange={(e) =>
                  setAttendanceForm({ ...attendanceForm, dept: e.target.value })
                }
                required
              />
            </label>
            <label>
              <span>Year</span>
              <input
                value={attendanceForm.year}
                onChange={(e) =>
                  setAttendanceForm({ ...attendanceForm, year: e.target.value })
                }
                required
              />
            </label>
            <label>
              <span>Section</span>
              <input
                value={attendanceForm.section}
                onChange={(e) =>
                  setAttendanceForm({
                    ...attendanceForm,
                    section: e.target.value,
                  })
                }
                required
              />
            </label>
            <label>
              <span>Subject</span>
              <input
                value={attendanceForm.subject}
                onChange={(e) =>
                  setAttendanceForm({
                    ...attendanceForm,
                    subject: e.target.value,
                  })
                }
                required
              />
            </label>
            <label>
              <span>Duration (minutes)</span>
              <input
                type="number"
                min="1"
                value={attendanceForm.durationMinuts}
                onChange={(e) =>
                  setAttendanceForm({
                    ...attendanceForm,
                    durationMinuts: e.target.value,
                  })
                }
                required
              />
            </label>
            <button className="primary-btn" type="submit">
              Create Session
            </button>
          </form>
          {activeSession ? (
            <div className="live-session-box">
              <div className="item-top">
                <div>
                  <h3>Active Session</h3>
                  <p>{activeSession.subject}</p>
                </div>
                <span
                  className={getStatusBadgeClass(
                    activeSession.isActive ? "ACTIVE" : "INACTIVE",
                  )}
                >
                  {activeSession.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
              <p className="session-code">{activeSession.sessionCode}</p>
              <div className="meta-grid">
                <span>
                  <strong>Department:</strong> {activeSession.dept}
                </span>
                <span>
                  <strong>Year:</strong> {activeSession.year}
                </span>
                <span>
                  <strong>Section:</strong> {activeSession.section}
                </span>
                <span>
                  <strong>Expires:</strong>{" "}
                  {formatDate(activeSession.expiresAt)}
                </span>
              </div>
              <div className="button-row">
                <button
                  className="secondary-btn"
                  type="button"
                  onClick={getReport}
                >
                  View Report
                </button>
                <button
                  className="danger-btn"
                  type="button"
                  onClick={closeSession}
                >
                  Close Session
                </button>
              </div>
            </div>
          ) : null}
          {report ? (
            <div className="table-wrap compact-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll No</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {report.records.length === 0 ? (
                    <tr>
                      <td colSpan="3">No students marked attendance yet.</td>
                    </tr>
                  ) : (
                    report.records.map((record) => (
                      <tr key={record._id}>
                        <td>{record.studentId?.name || "-"}</td>
                        <td>{record.studentId?.rollNo || "-"}</td>
                        <td>{formatDate(record.markedAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : null}
        </SectionCard>

        <SectionCard
          title="Create Assignment"
          subtitle="Publish assignments for a specific batch and section."
        >
          <form className="form-grid" onSubmit={createAssignment}>
            <label>
              <span>Title</span>
              <input
                value={assignmentForm.title}
                onChange={(e) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    title: e.target.value,
                  })
                }
                required
              />
            </label>
            <label>
              <span>Subject</span>
              <input
                value={assignmentForm.subject}
                onChange={(e) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    subject: e.target.value,
                  })
                }
                required
              />
            </label>
            <label>
              <span>Department</span>
              <input
                value={assignmentForm.dept}
                onChange={(e) =>
                  setAssignmentForm({ ...assignmentForm, dept: e.target.value })
                }
                required
              />
            </label>
            <label>
              <span>Year</span>
              <input
                value={assignmentForm.year}
                onChange={(e) =>
                  setAssignmentForm({ ...assignmentForm, year: e.target.value })
                }
                required
              />
            </label>
            <label>
              <span>Section</span>
              <input
                value={assignmentForm.section}
                onChange={(e) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    section: e.target.value,
                  })
                }
                required
              />
            </label>
            <label>
              <span>Due Date</span>
              <input
                type="datetime-local"
                value={assignmentForm.dueDate}
                onChange={(e) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    dueDate: e.target.value,
                  })
                }
                required
              />
            </label>
            <label className="full-width">
              <span>Description</span>
              <textarea
                rows="4"
                value={assignmentForm.description}
                onChange={(e) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    description: e.target.value,
                  })
                }
              />
            </label>
            <label className="full-width">
              <span>Optional Attachment</span>
              <input
                type="file"
                onChange={(e) =>
                  setAssignmentAttachment(e.target.files?.[0] || null)
                }
                accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg,.ppt,.pptx"
              />
            </label>
            <button className="primary-btn" type="submit">
              Publish Assignment
            </button>
          </form>
        </SectionCard>
      </div>

      <div className="two-column-grid">
        <SectionCard
          title="Pending Student Approvals"
          subtitle="Approve or reject new students in your department."
        >
          <div className="card-list">
            {pendingStudents.length === 0 ? (
              <div className="empty-state">No pending student approvals.</div>
            ) : (
              pendingStudents.map((student) => (
                <article className="item-card" key={student._id}>
                  <div className="item-top">
                    <div>
                      <h3>{student.name}</h3>
                      <p>{student.rollNo}</p>
                    </div>
                    <span className="badge warning">PENDING</span>
                  </div>
                  <div className="meta-grid">
                    <span>
                      <strong>Dept:</strong> {student.dept}
                    </span>
                    <span>
                      <strong>Year:</strong> {student.year}
                    </span>
                    <span>
                      <strong>Section:</strong> {student.section}
                    </span>
                  </div>
                  <div className="button-row">
                    <button
                      className="primary-btn"
                      type="button"
                      onClick={() => approveStudent(student._id, "APPROVED")}
                    >
                      Approve
                    </button>
                    <button
                      className="danger-btn"
                      type="button"
                      onClick={() => approveStudent(student._id, "REJECTED")}
                    >
                      Reject
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Faculty Leave"
          subtitle="Submit your leave and track its approval status."
        >
          <form className="form-grid" onSubmit={submitLeave}>
            <label>
              <span>Leave Date</span>
              <input
                type="date"
                value={leaveForm.leaveDate}
                onChange={(e) =>
                  setLeaveForm({ ...leaveForm, leaveDate: e.target.value })
                }
                required
              />
            </label>
            <label className="full-width">
              <span>Reason</span>
              <textarea
                rows="3"
                value={leaveForm.reason}
                onChange={(e) =>
                  setLeaveForm({ ...leaveForm, reason: e.target.value })
                }
              />
            </label>
            <button className="primary-btn" type="submit">
              Submit Leave
            </button>
          </form>
          <div className="table-wrap compact-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.length === 0 ? (
                  <tr>
                    <td colSpan="3">No leave requests yet.</td>
                  </tr>
                ) : (
                  myLeaves.map((item) => (
                    <tr key={item._id}>
                      <td>{formatShortDate(item.leaveDate)}</td>
                      <td>
                        <span className={getStatusBadgeClass(item.status)}>
                          {item.status}
                        </span>
                      </td>
                      <td>{item.reason || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="My Published Assignments"
        subtitle="Track assignment deadlines and submission counts."
        action={
          <button
            className="secondary-btn"
            onClick={loadFacultyAssignments}
            disabled={loadingAssignments}
          >
            {loadingAssignments ? "Refreshing..." : "Refresh"}
          </button>
        }
      >
        <div className="card-list">
          {facultyAssignments.length === 0 ? (
            <div className="empty-state">No assignments published yet.</div>
          ) : (
            facultyAssignments.map((assignment) => (
              <article className="item-card" key={assignment._id}>
                <div className="item-top">
                  <div>
                    <h3>{assignment.title}</h3>
                    <p>{assignment.subject}</p>
                  </div>
                  <span className="badge">
                    Due {formatDate(assignment.dueDate)}
                  </span>
                </div>
                <div className="meta-grid">
                  <span>
                    <strong>Dept:</strong> {assignment.dept}
                  </span>
                  <span>
                    <strong>Year:</strong> {assignment.year}
                  </span>
                  <span>
                    <strong>Section:</strong> {assignment.section}
                  </span>
                  <span>
                    <strong>Total:</strong>{" "}
                    {assignment.submissionStats?.totalSubmissions || 0}
                  </span>
                  <span>
                    <strong>Rejected:</strong>{" "}
                    {assignment.submissionStats?.rejectedSubmissions || 0}
                  </span>
                </div>
                <p className="description-text">
                  {assignment.description || "No description provided."}
                </p>
                <div className="button-row">
                  {assignment.attachmentUrl ? (
                    <a
                      className="secondary-btn link-btn"
                      href={`${FILE_BASE}${assignment.attachmentUrl}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Attachment
                    </a>
                  ) : null}
                  <button
                    className="primary-btn"
                    type="button"
                    onClick={() => viewSubmissions(assignment._id)}
                  >
                    View Submissions
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Submission Viewer"
        subtitle={
          selectedAssignment
            ? `Showing submissions for ${selectedAssignment.title}`
            : "Select an assignment to view submissions."
        }
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No</th>
                <th>Status</th>
                <th>Submitted At</th>
                <th>Comment</th>
                <th>File</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {!submissionsView || submissionsView.submissions.length === 0 ? (
                <tr>
                  <td colSpan="7">No submissions to display.</td>
                </tr>
              ) : (
                submissionsView.submissions.map((submission) => {
                  const current = reviewForm[submission._id] || {
                    status: "REJECTED",
                    facultyRemark: submission.facultyRemark || "",
                  };
                  return (
                    <tr key={submission._id}>
                      <td>{submission.studentId?.name || "-"}</td>
                      <td>{submission.studentId?.rollNo || "-"}</td>
                      <td>
                        <span
                          className={getStatusBadgeClass(submission.status)}
                        >
                          {submission.status}
                        </span>
                      </td>
                      <td>{formatDate(submission.submittedAt)}</td>
                      <td>{submission.comment || "-"}</td>
                      <td>
                        <a
                          className="text-link"
                          href={`${FILE_BASE}${submission.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open File
                        </a>
                      </td>
                      <td>
                        <div className="inline-review">
                          <select
                            value={current.status}
                            onChange={(e) =>
                              setReviewForm({
                                ...reviewForm,
                                [submission._id]: {
                                  ...current,
                                  status: e.target.value,
                                },
                              })
                            }
                          >
                            <option value="REJECTED">Reject</option>
                            <option value="SUBMITTED">Accept</option>
                          </select>
                          <input
                            value={current.facultyRemark}
                            onChange={(e) =>
                              setReviewForm({
                                ...reviewForm,
                                [submission._id]: {
                                  ...current,
                                  facultyRemark: e.target.value,
                                },
                              })
                            }
                            placeholder="Remark"
                          />
                          <button
                            className="secondary-btn"
                            type="button"
                            onClick={() =>
                              reviewSubmission(
                                selectedAssignmentId,
                                submission._id,
                              )
                            }
                          >
                            Save
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard
        title="Student Attendance Tracker"
        subtitle="Track attendance count for your students."
      >
        <div className="table-wrap compact-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No</th>
                <th>Dept</th>
                <th>Year</th>
                <th>Section</th>
                <th>Present Count</th>
              </tr>
            </thead>
            <tbody>
              {studentAttendance.length === 0 ? (
                <tr>
                  <td colSpan="6">No attendance data available.</td>
                </tr>
              ) : (
                studentAttendance.map((student) => (
                  <tr key={student._id}>
                    <td>{student.name}</td>
                    <td>{student.rollNo || "-"}</td>
                    <td>{student.dept || "-"}</td>
                    <td>{student.year || "-"}</td>
                    <td>{student.section || "-"}</td>
                    <td>{student.presentCount || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

function AdminPanel({ token, setToast }) {
  const [dashboard, setDashboard] = useState(null);
  const [pendingFaculty, setPendingFaculty] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [overview, setOverview] = useState({ announcements: [], leaves: [] });
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: "",
    audience: "ALL",
  });
  const [facultyAttendanceForm, setFacultyAttendanceForm] = useState({
    subject: "",
    durationMinuts: 5,
  });
  const [activeFacultySession, setActiveFacultySession] = useState(null);
  const [facultyAttendanceReport, setFacultyAttendanceReport] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [facultySummary, setFacultySummary] = useState([]);
  const [studentSummary, setStudentSummary] = useState([]);

  const loadDashboard = async () => {
    try {
      const [dash, users, overviewData, leaves, facAtt, stuAtt] =
        await Promise.all([
          apiRequest("/admin/dashboard", { token }),
          apiRequest("/admin/users", { token }),
          apiRequest("/admin/overview", { token }),
          apiRequest("/admin/leave-requests", { token }),
          apiRequest("/admin/attendance/faculty-summary", { token }),
          apiRequest("/admin/attendance/student-summary", { token }),
        ]);
      setDashboard(dash);
      setAllUsers(users.users || []);
      setPendingFaculty(
        (users.users || []).filter(
          (item) =>
            item.role === "FACULTY" && item.approvalStatus === "PENDING",
        ),
      );
      setOverview(overviewData);
      setLeaveRequests(leaves.leaves || []);
      setFacultySummary(facAtt.faculty || []);
      setStudentSummary(stuAtt.students || []);
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const decideUser = async (userId, status) => {
    try {
      const data = await apiRequest(`/admin/users/${userId}/approval`, {
        method: "POST",
        token,
        body: { status },
      });
      setToast({ type: "success", message: data.message || "User updated" });
      loadDashboard();
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  };

  const postAnnouncement = async (event) => {
    event.preventDefault();
    try {
      const data = await apiRequest("/admin/announcements", {
        method: "POST",
        token,
        body: announcementForm,
      });
      setToast({
        type: "success",
        message: `${data.message || "Announcement posted"}. Email notification hook is not configured yet, so notifications stay in-app.`,
      });
      setAnnouncementForm({ title: "", message: "", audience: "ALL" });
      loadDashboard();
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  };

  const submitLeaveDecision = async (leaveId, status) => {
    try {
      const data = await apiRequest(
        `/admin/leave-requests/${leaveId}/decision`,
        { method: "POST", token, body: { status } },
      );
      setToast({ type: "success", message: data.message || "Leave updated" });
      loadDashboard();
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  };

  const createFacultyAttendanceSession = async (event) => {
    event.preventDefault();
    try {
      const data = await apiRequest("/faculty-attendance/session", {
        method: "POST",
        token,
        body: facultyAttendanceForm,
      });
      setActiveFacultySession(data.session);
      setFacultyAttendanceReport(null);
      setToast({
        type: "success",
        message: data.message || "Faculty attendance session created",
      });
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  };

  const viewFacultyAttendanceReport = async () => {
    if (!activeFacultySession?.id) return;
    try {
      const data = await apiRequest(
        `/faculty-attendance/session/${activeFacultySession.id}/report`,
        { token },
      );
      setFacultyAttendanceReport(data);
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  };

  const closeFacultySession = async () => {
    if (!activeFacultySession?.id) return;
    try {
      const data = await apiRequest(
        `/faculty-attendance/session/${activeFacultySession.id}/close`,
        { method: "POST", token },
      );
      setToast({ type: "success", message: data.message || "Session closed" });
      setActiveFacultySession((prev) =>
        prev ? { ...prev, isActive: false } : null,
      );
      loadDashboard();
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  };

  const cards = dashboard
    ? [
        { label: "Campus Code", value: dashboard.campusCode },
        { label: "Students", value: dashboard.totalStudents },
        { label: "Faculty", value: dashboard.totalFaculty },
        { label: "Pending Faculty", value: dashboard.pendingFaculty },
        { label: "Pending Students", value: dashboard.pendingStudents },
        { label: "Faculty On Leave Today", value: dashboard.facultyOnLeave },
      ]
    : [];

  return (
    <div className="panel-space">
      <SummaryCards cards={cards} />
      <AnnouncementsPanel token={token} title="Announcement Feed" />

      <div className="two-column-grid">
        <SectionCard
          title="Campus Approval Queue"
          subtitle="Approve faculty accounts for this campus."
        >
          <div className="card-list">
            {pendingFaculty.length === 0 ? (
              <div className="empty-state">No pending faculty approvals.</div>
            ) : (
              pendingFaculty.map((item) => (
                <article className="item-card" key={item._id}>
                  <div className="item-top">
                    <div>
                      <h3>{item.name}</h3>
                      <p>{item.email}</p>
                    </div>
                    <span className="badge warning">PENDING</span>
                  </div>
                  <div className="meta-grid">
                    <span>
                      <strong>Dept:</strong> {item.dept || "-"}
                    </span>
                    <span>
                      <strong>Section:</strong> {item.section || "-"}
                    </span>
                  </div>
                  <div className="button-row">
                    <button
                      className="primary-btn"
                      onClick={() => decideUser(item._id, "APPROVED")}
                    >
                      Approve
                    </button>
                    <button
                      className="danger-btn"
                      onClick={() => decideUser(item._id, "REJECTED")}
                    >
                      Reject
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Post Announcement"
          subtitle="Send notice to everyone or only faculty."
        >
          <form className="form-grid" onSubmit={postAnnouncement}>
            <label>
              <span>Title</span>
              <input
                value={announcementForm.title}
                onChange={(e) =>
                  setAnnouncementForm({
                    ...announcementForm,
                    title: e.target.value,
                  })
                }
                required
              />
            </label>
            <label>
              <span>Audience</span>
              <select
                value={announcementForm.audience}
                onChange={(e) =>
                  setAnnouncementForm({
                    ...announcementForm,
                    audience: e.target.value,
                  })
                }
              >
                <option value="ALL">Everyone</option>
                <option value="FACULTY">Faculty Only</option>
                <option value="STUDENT">Students Only</option>
              </select>
            </label>
            <label className="full-width">
              <span>Message</span>
              <textarea
                rows="5"
                value={announcementForm.message}
                onChange={(e) =>
                  setAnnouncementForm({
                    ...announcementForm,
                    message: e.target.value,
                  })
                }
                required
              />
            </label>
            <button className="primary-btn" type="submit">
              Post Notice
            </button>
          </form>
        </SectionCard>
      </div>

      <div className="two-column-grid">
        <SectionCard
          title="Faculty Leave Requests"
          subtitle="Approve or reject faculty leave."
        >
          <div className="card-list">
            {leaveRequests.length === 0 ? (
              <div className="empty-state">No leave requests available.</div>
            ) : (
              leaveRequests.map((item) => (
                <article className="item-card" key={item._id}>
                  <div className="item-top">
                    <div>
                      <h3>{item.facultyId?.name || "-"}</h3>
                      <p>{formatShortDate(item.leaveDate)}</p>
                    </div>
                    <span className={getStatusBadgeClass(item.status)}>
                      {item.status}
                    </span>
                  </div>
                  <p className="description-text">
                    {item.reason || "No reason shared."}
                  </p>
                  {item.status === "PENDING" ? (
                    <div className="button-row">
                      <button
                        className="primary-btn"
                        onClick={() =>
                          submitLeaveDecision(item._id, "APPROVED")
                        }
                      >
                        Approve
                      </button>
                      <button
                        className="danger-btn"
                        onClick={() =>
                          submitLeaveDecision(item._id, "REJECTED")
                        }
                      >
                        Reject
                      </button>
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Faculty Attendance Session"
          subtitle="Admin can create and manage faculty attendance sessions."
        >
          <form className="form-grid" onSubmit={createFacultyAttendanceSession}>
            <label>
              <span>Subject / Purpose</span>
              <input
                value={facultyAttendanceForm.subject}
                onChange={(e) =>
                  setFacultyAttendanceForm({
                    ...facultyAttendanceForm,
                    subject: e.target.value,
                  })
                }
                required
              />
            </label>
            <label>
              <span>Duration (minutes)</span>
              <input
                type="number"
                min="1"
                value={facultyAttendanceForm.durationMinuts}
                onChange={(e) =>
                  setFacultyAttendanceForm({
                    ...facultyAttendanceForm,
                    durationMinuts: e.target.value,
                  })
                }
                required
              />
            </label>
            <button className="primary-btn">Create Session</button>
          </form>
          {activeFacultySession ? (
            <div className="live-session-box">
              <div className="item-top">
                <div>
                  <h3>Live Faculty Session</h3>
                  <p>{activeFacultySession.subject}</p>
                </div>
                <span
                  className={getStatusBadgeClass(
                    activeFacultySession.isActive ? "ACTIVE" : "INACTIVE",
                  )}
                >
                  {activeFacultySession.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
              <p className="session-code">{activeFacultySession.sessionCode}</p>
              <div className="button-row">
                <button
                  className="secondary-btn"
                  onClick={viewFacultyAttendanceReport}
                >
                  View Report
                </button>
                <button className="danger-btn" onClick={closeFacultySession}>
                  Close Session
                </button>
              </div>
            </div>
          ) : null}
          {facultyAttendanceReport ? (
            <div className="table-wrap compact-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Faculty</th>
                    <th>Email</th>
                    <th>Marked At</th>
                  </tr>
                </thead>
                <tbody>
                  {facultyAttendanceReport.records.length === 0 ? (
                    <tr>
                      <td colSpan="3">No faculty marked attendance yet.</td>
                    </tr>
                  ) : (
                    facultyAttendanceReport.records.map((item) => (
                      <tr key={item._id}>
                        <td>{item.facultyId?.name || "-"}</td>
                        <td>{item.facultyId?.email || "-"}</td>
                        <td>{formatDate(item.markedAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : null}
        </SectionCard>
      </div>

      <SectionCard
        title="Campus Users"
        subtitle="Manage every student and faculty member in this campus."
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Dept</th>
                <th>Year</th>
                <th>Section</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.length === 0 ? (
                <tr>
                  <td colSpan="7">No users found.</td>
                </tr>
              ) : (
                allUsers.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.role}</td>
                    <td>{item.email}</td>
                    <td>{item.dept || "-"}</td>
                    <td>{item.year || "-"}</td>
                    <td>{item.section || "-"}</td>
                    <td>
                      <span
                        className={getStatusBadgeClass(item.approvalStatus)}
                      >
                        {item.approvalStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="two-column-grid">
        <SectionCard
          title="Faculty Attendance Tracker"
          subtitle="Track faculty attendance counts."
        >
          <div className="table-wrap compact-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Faculty</th>
                  <th>Email</th>
                  <th>Dept</th>
                  <th>Present Count</th>
                </tr>
              </thead>
              <tbody>
                {facultySummary.length === 0 ? (
                  <tr>
                    <td colSpan="4">No faculty attendance data.</td>
                  </tr>
                ) : (
                  facultySummary.map((item) => (
                    <tr key={item._id}>
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td>{item.dept || "-"}</td>
                      <td>{item.presentCount || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
        <SectionCard
          title="Student Attendance Tracker"
          subtitle="Campus-wide student attendance snapshot."
        >
          <div className="table-wrap compact-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No</th>
                  <th>Dept</th>
                  <th>Present Count</th>
                </tr>
              </thead>
              <tbody>
                {studentSummary.length === 0 ? (
                  <tr>
                    <td colSpan="4">No student attendance data.</td>
                  </tr>
                ) : (
                  studentSummary.map((item) => (
                    <tr key={item._id}>
                      <td>{item.name}</td>
                      <td>{item.rollNo || "-"}</td>
                      <td>{item.dept || "-"}</td>
                      <td>{item.presentCount || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Recent Admin Overview"
        subtitle="Quick snapshot of latest activity."
      >
        <div className="two-column-grid">
          <div className="card-list">
            {(overview.announcements || []).slice(0, 5).map((item) => (
              <article key={item._id} className="item-card">
                <h3>{item.title}</h3>
                <p className="description-text">{item.message}</p>
              </article>
            ))}
          </div>
          <div className="card-list">
            {(overview.leaves || []).length === 0 ? (
              <div className="empty-state">
                No faculty leave visibility for today.
              </div>
            ) : (
              overview.leaves.map((item) => (
                <article key={item._id} className="item-card">
                  <h3>{item.facultyId?.name || "-"}</h3>
                  <p className="description-text">
                    {item.reason || "No reason shared."}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function Dashboard({ token, user, onLogout }) {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timeout);
  }, [toast]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Semester Project Submission Ready</p>
          <h1>Smart Campus Dashboard</h1>
        </div>
        <div className="topbar-actions">
          <div className="user-chip">
            <strong>{user.name}</strong>
            <span>{user.role}</span>
          </div>
          <button className="secondary-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="profile-strip">
        <span>
          <strong>Email:</strong> {user.email}
        </span>
        {user.campusCode ? (
          <span>
            <strong>Campus Code:</strong> {user.campusCode}
          </span>
        ) : null}
        {user.adminCode ? (
          <span>
            <strong>Admin Code:</strong> {user.adminCode}
          </span>
        ) : null}
        {user.rollNo ? (
          <span>
            <strong>Roll No:</strong> {user.rollNo}
          </span>
        ) : null}
        {user.dept ? (
          <span>
            <strong>Department:</strong> {user.dept}
          </span>
        ) : null}
        {user.year ? (
          <span>
            <strong>Year:</strong> {user.year}
          </span>
        ) : null}
        {user.section ? (
          <span>
            <strong>Section:</strong> {user.section}
          </span>
        ) : null}
      </section>

      {toast ? (
        <div
          className={`alert ${toast.type === "error" ? "error" : "success"}`}
        >
          {toast.message}
        </div>
      ) : null}

      {user.role === "STUDENT" ? (
        <StudentPanel token={token} user={user} setToast={setToast} />
      ) : null}
      {user.role === "FACULTY" ? (
        <FacultyPanel token={token} user={user} setToast={setToast} />
      ) : null}
      {user.role === "ADMIN" ? (
        <AdminPanel token={token} user={user} setToast={setToast} />
      ) : null}
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("scms_token") || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("scms_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [bootstrapping, setBootstrapping] = useState(Boolean(token));

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setBootstrapping(false);
        return;
      }
      try {
        const data = await apiRequest("/auth/me", { token });
        setUser(data.user);
        localStorage.setItem("scms_user", JSON.stringify(data.user));
      } catch {
        localStorage.removeItem("scms_token");
        localStorage.removeItem("scms_user");
        setToken("");
        setUser(null);
      } finally {
        setBootstrapping(false);
      }
    };
    fetchMe();
  }, [token]);

  const handleAuthSuccess = (data) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("scms_token", data.token);
    localStorage.setItem("scms_user", JSON.stringify(data.user));
  };

  const handleLogout = async () => {
    try {
      if (token) await apiRequest("/auth/logout", { method: "POST", token });
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("scms_token");
      localStorage.removeItem("scms_user");
      setToken("");
      setUser(null);
    }
  };

  if (bootstrapping)
    return <div className="loading-screen">Loading Smart Campus...</div>;
  if (!token || !user) return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  return <Dashboard token={token} user={user} onLogout={handleLogout} />;
}
