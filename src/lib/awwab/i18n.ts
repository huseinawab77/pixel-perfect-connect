// Centralized translations. Language is a presentation layer only — it never touches data.
import { useMemo, useSyncExternalStore } from "react";
import { SYSTEM_DEFAULTS, type Activity, type DomainId } from "./config";

export type Lang = "id" | "en";
export type Params = Record<string, string | number>;
export type T = (key: string, p?: Params) => string;

const en = {
  // navigation
  "nav.home": "Home", "nav.daily": "Daily", "nav.weekly": "Weekly", "nav.monthly": "Monthly", "nav.insights": "Insights",
  "nav.goals": "Goals", "nav.review": "Review", "nav.calendar": "Calendar", "nav.settings": "Settings",
  "app.tagline": "simple to use, deep underneath", "common.loading": "Loading",
  // common
  "common.save": "Save", "common.cancel": "Cancel", "common.close": "Close", "common.saved": "Saved.", "common.prev": "Previous", "common.next": "Next",
  "common.notEnough": "Not enough data.", "common.notEnoughShort": "Not enough data", "common.overdue": "Overdue", "common.and": "and", "common.pts": "{n} pts",
  "cat.alt": "Cat illustration",
  // domains
  "domain.academic": "Academic", "domain.health": "Health & Fitness", "domain.finance": "Finance", "domain.career": "Career",
  "domain.personal": "Personal Development", "domain.social": "Social & Relationships", "domain.life": "Life Management",
  // activities
  "act.study_session": "Study Session", "act.deep_work": "Deep Work", "act.task_completion": "Task Completion", "act.gym": "Gym",
  "act.daily_steps": "Daily Steps", "act.protein": "Protein Intake", "act.fruit_veg": "Fruit & Vegetable", "act.expense_tracking": "Expense Tracking",
  "act.skill_dev": "Skill Development", "act.competition": "Competition", "act.project_completion": "Project Completion",
  "act.professional_event": "Professional Event", "act.networking": "Networking", "act.reading": "Reading", "act.journaling": "Journaling",
  "act.family_time": "Quality Time with Family", "act.helping_others": "Helping Others", "act.friendship_followup": "Friendship Follow-up",
  "act.relationship_followup": "Relationship Follow-up", "act.laundry": "Laundry", "act.meal_planning": "Weekly Meal Planning",
  // targets
  "target.study_session": "5× / week", "target.deep_work": "600 min / week", "target.task_completion": "100% on-time", "target.gym": "3× / week",
  "target.daily_steps": "6,000 / day", "target.protein": "120 g / day", "target.fruit_veg": "2 occasions / day", "target.expense_tracking": "100% recorded",
  "target.skill_dev": "30 min / day", "target.competition": "2× / month", "target.project_completion": "1 / month", "target.professional_event": "1× / month",
  "target.networking": "5 / week", "target.reading": "10 pages / day", "target.journaling": "1 page / day", "target.family_time": "2× / month",
  "target.helping_others": "3 / week", "target.friendship_followup": "2× / month", "target.relationship_followup": "2× / month",
  "target.laundry": "1× / week", "target.meal_planning": "1× / week", "target.everyDay": "every day",
  "per.day": "day", "per.week": "week", "per.month": "month",
  "unit.min": "min", "unit.steps": "steps", "unit.g": "g", "unit.sessions": "sessions", "unit.times": "times", "unit.projects": "projects",
  "unit.events": "events", "unit.connections": "connections", "unit.acts": "acts", "unit.day": "days",
  // periods
  "period.this.week": "this week", "period.this.month": "this month", "period.last.week": "last week", "period.last.month": "last month",
  "period.prev.week": "previous week", "period.prev.month": "previous month",
  "period.title.week": "This week", "period.title.month": "This month", "period.soFar": "{label} · only days so far are counted",
  "period.sub.week": "Monday-to-Sunday performance", "period.sub.month": "Calendar-month performance",
  "seg.week": "This Week", "seg.month": "This Month", "week.n": "Week {n}",
  "sec.domainsActs": "Domains & activities", "sec.domainsHint": "Tap a domain to see how each activity contributes.",
  // life score / performance
  "life.label": "Life Score", "life.noneBody": "Keep tracking your daily actions. Once there's enough data, your Life Score will appear here.",
  "life.vs": "vs {prev}", "life.noPrev": "Not enough previous data.", "life.basedOn": "Based on {n} of {total} activities with data.",
  "trend.improving": "Improving", "trend.declining": "Declining", "trend.stable": "Stable", "trend.none": "Not enough data to show a meaningful trend.",
  "detail.noData": "No data", "detail.daysRecorded": "{a} of {b} recorded days", "detail.daysOnTarget": "{a} of {b} days on target", "detail.target": "target {t}",
  "detail.weight": "weight",
  "hl.strongest": "Strongest area", "hl.attention": "Needs attention", "hl.improve": "Biggest improvement", "hl.decline": "Biggest decline",
  "hl.noImprove": "No major improvement yet", "hl.noDecline": "No major decline",
  // insights
  "ins.primary": "Primary", "ins.show": "Show evidence", "ins.hide": "Hide evidence",
  "ins.none.title": "Not enough data yet", "ins.none.desc": "Track a few activities {period} and AWWAB will start explaining what's happening.",
  "ins.domainDown": "{domain} declined {n} points {period}.", "ins.domainUp": "{domain} improved {n} points {period}.",
  "ins.contrib.one": "{names} was the largest contributor.", "ins.contrib.many": "{names} were the largest contributors.",
  "ins.compared": "Compared with {prev}.",
  "ins.weakest": "{domain} is your lowest area {period} at {n}.", "ins.weakest.desc": "{act} ({p}) carries the largest weighted gap in this area.",
  "ins.weakest.descNone": "Its tracked activities sit below the others.",
  "ins.recWeak": "{act} has remained below target for three consecutive {units}.", "ins.recStrong": "{act} has remained consistently on target for three {units}.",
  "ins.units.week": "weeks", "ins.units.month": "months", "ins.targetDesc": "Target: {target}.",
  "ins.ev.current": "Current: {p}", "ins.ev.ago1.week": "Last week: {p}", "ins.ev.ago2.week": "2 weeks ago: {p}",
  "ins.ev.ago1.month": "Last month: {p}", "ins.ev.ago2.month": "2 months ago: {p}",
  "ins.actDown": "{act} consistency dropped from {a} to {b}.", "ins.actUp": "{act} consistency rose from {a} to {b}.",
  "ins.strongest": "{domain} is your strongest area {period} at {n}.", "ins.strongest.desc": "Based on the activities you've recorded.",
  "ins.title": "Why things look this way", "ins.subtitle": "What happened, and which behaviours were associated with it. Every line traces back to your data.",
  // daily
  "daily.today": "Today", "daily.future": "This day hasn't happened yet. Entries here won't count until it does.",
  "daily.hint": "{n} of {total} recorded · tap once for done, twice for not done, three times to clear.",
  "check.done": "Done", "check.notDone": "Not done", "check.none": "No data", "daily.inUnit": "{act} in {unit}",
  "daily.empty": "No active habits. Add some in Settings.",
  // home
  "greet.morning": "Good morning", "greet.afternoon": "Good afternoon", "greet.evening": "Good evening", "greet.night": "Good night",
  "home.start": "Start tracking today. One to three minutes is enough.", "home.openTracker": "Open today's tracker", "home.domains": "Domains",
  "home.happening": "What's happening?", "home.allInsights": "All insights →", "home.monthTrend": "This month, week by week",
  "home.nextFocus": "Next focus", "home.chosenFocus": "Your chosen focus", "home.due": "Due {d}", "home.nothing": "Nothing scheduled.", "home.setGoal": "Set a goal",
  "type.goal": "Goal", "type.project": "Project", "type.milestone": "Milestone",
  // goals
  "goals.title": "Where you're heading", "goals.subtitle": "Goal progress comes from projects and milestones — it's separate from your Life Score.",
  "filter.active": "Active", "filter.completed": "Completed", "filter.archived": "Archived", "goals.new": "New goal",
  "goals.empty.active": "No active goals yet", "goals.empty.completed": "No completed goals", "goals.empty.archived": "No archived goals",
  "goals.emptyBody": "Goals hold projects, and projects hold milestones. Start with one thing that matters.",
  "goals.titlePh": "Goal title, e.g. Build portfolio", "goals.whyPh": "Why it matters (optional)", "goals.domain": "Domain", "goals.noDomain": "No domain",
  "goals.targetDate": "Target date", "goals.create": "Create goal", "goals.overdue": "Overdue · ", "goals.target": "Target ",
  "goals.edit": "Edit goal", "goals.archive": "Archive goal", "goals.restore": "Restore goal", "goals.noMilestones": "No milestones yet.",
  "goals.noProjects": "No projects yet.", "goals.addProject": "Add project",
  "proj.titlePh": "Project title", "proj.deadline": "Project deadline", "proj.due": " · due {d}", "proj.noMs": "No milestones yet",
  "proj.edit": "Edit project", "proj.archive": "Archive project", "proj.restore": "Restore project",
  "status.not_started": "Not started", "status.in_progress": "In progress", "status.completed": "Completed", "status.archived": "Archived",
  "status.pending": "Pending", "status.active": "Active",
  "ms.complete": "Complete {t}", "ms.edit": "Edit {t}", "ms.delete": "Delete {t}", "ms.confirmDelete": "Delete milestone \"{t}\"? This can't be undone.",
  "ms.add": "Add milestone", "ms.due": "Milestone due date", "ms.title": "Milestone title",
  // review
  "review.eyebrow": "Monthly Review", "review.subtitle": "Look back, understand, reflect, look forward.", "review.prevMonth": "Previous month",
  "review.noCompare": "No comparison", "review.strongest": "Strongest", "review.wentWell": "What went well", "review.strongestArea": "Strongest area:",
  "review.improved": "{d} improved +{n} pts", "review.completedProject": "Completed project:", "review.msCompleted": "{n} milestone(s) completed",
  "review.nothing": "Nothing recorded yet for this month.", "review.declined": "{d} declined {n} pts", "review.lowest": "Lowest area:",
  "review.overdueMs": "Overdue milestone: {t} ({d})", "review.dueSoon": "{t} is due {d}", "review.nothingFlagged": "Nothing flagged.",
  "review.goals": "Goals", "review.noGoals": "No goals yet.", "col.goal": "Goal", "col.prev": "Previous", "col.cur": "Current", "col.nextMs": "Next milestone",
  "review.reflection": "Reflection", "review.q.wentWell": "What went well?", "review.q.difficult": "What was difficult?",
  "review.q.change": "What should I change next month?", "review.q.stop": "What should I stop doing?", "review.q.continue": "What should I continue doing?",
  "review.focus": "My one focus for next month", "review.focusPh": "e.g. Academic, or Finish AWWAB MVP", "review.update": "Update review",
  "review.save": "Save review", "review.past": "Past reviews",
  // calendar
  "cal.subtitle": "Important dates from your goals, projects and milestones.", "cal.in": " · in {p}", "cal.open": "Open in Goals",
  "cal.upcoming": "Upcoming", "cal.nothing": "Nothing upcoming. Add dates to goals, projects or milestones to see them here.",
  "wd.0": "Mon", "wd.1": "Tue", "wd.2": "Wed", "wd.3": "Thu", "wd.4": "Fri", "wd.5": "Sat", "wd.6": "Sun",
  // settings / habits
  "settings.subtitle": "Language and the habits you track.", "settings.language": "Language",
  "settings.langHint": "Only the interface changes. Your data stays the same.",
  "habits.title": "Activities & Habits", "habits.add": "Add Habit", "habits.edit": "Edit Habit", "habits.archive": "Archive Habit", "habits.archiveShort": "Archive",
  "habits.delete": "Delete", "habits.reactivate": "Reactivate", "habits.name": "Habit Name", "habits.inputType": "Input Type",
  "input.checklist": "Checklist", "input.quantitative": "Quantitative", "habits.target": "Target", "habits.unit": "Unit", "habits.unitPh": "e.g. ml, min, pages",
  "habits.frequency": "Frequency", "freq.day": "Daily", "freq.week": "Weekly", "freq.month": "Monthly", "habits.weight": "Weight (%)",
  "habits.save": "Save Habit", "habits.active": "Active habits", "habits.archived": "Archived", "habits.archivedOn": "Archived {d}",
  "habits.noArchived": "No archived habits.", "habits.weightWarn": "Activity weights in {domain} total {n}%, not 100%.",
  "habits.rebalance": "Rebalance to 100%",
  "habits.historyWarn": "This habit has historical data. It will be archived instead of permanently deleted.",
  "habits.confirmDelete": "Delete this habit permanently?", "habits.err.name": "Enter a habit name.",
  "habits.err.target": "Target must be a number above 0.", "habits.err.weight": "Weight must be between 0 and 100.",
  "habits.err.dup": "A habit with this name already exists in this domain.",
  "habits.historyNote": "Changes apply from today. Past periods keep their old settings.", "habits.custom": "Custom",
  "habits.checkHint": "For daily checklist habits, ticking the box means you hit the target that day.",
};

type Key = keyof typeof en;

const id: Record<Key, string> = {
  "nav.home": "Beranda", "nav.daily": "Harian", "nav.weekly": "Mingguan", "nav.monthly": "Bulanan", "nav.insights": "Wawasan",
  "nav.goals": "Tujuan", "nav.review": "Review", "nav.calendar": "Kalender", "nav.settings": "Pengaturan",
  "app.tagline": "sederhana dipakai, dalam di baliknya", "common.loading": "Memuat",
  "common.save": "Simpan", "common.cancel": "Batal", "common.close": "Tutup", "common.saved": "Tersimpan.", "common.prev": "Sebelumnya", "common.next": "Berikutnya",
  "common.notEnough": "Belum cukup data.", "common.notEnoughShort": "Belum cukup data", "common.overdue": "Terlambat", "common.and": "dan", "common.pts": "{n} poin",
  "cat.alt": "Ilustrasi kucing",
  "domain.academic": "Akademik", "domain.health": "Kesehatan & Kebugaran", "domain.finance": "Keuangan", "domain.career": "Karier",
  "domain.personal": "Pengembangan Diri", "domain.social": "Sosial & Hubungan", "domain.life": "Manajemen Kehidupan",
  "act.study_session": "Study Session", "act.deep_work": "Deep Work", "act.task_completion": "Penyelesaian Tugas", "act.gym": "Gym",
  "act.daily_steps": "Langkah Harian", "act.protein": "Asupan Protein", "act.fruit_veg": "Buah & Sayur", "act.expense_tracking": "Pencatatan Pengeluaran",
  "act.skill_dev": "Pengembangan Skill", "act.competition": "Kompetisi", "act.project_completion": "Penyelesaian Project",
  "act.professional_event": "Acara Profesional", "act.networking": "Networking", "act.reading": "Membaca", "act.journaling": "Journaling",
  "act.family_time": "Quality Time dengan Keluarga", "act.helping_others": "Membantu Orang Lain", "act.friendship_followup": "Follow-up Pertemanan",
  "act.relationship_followup": "Follow-up Relationship", "act.laundry": "Mencuci Pakaian", "act.meal_planning": "Perencanaan Makan Mingguan",
  "target.study_session": "5× / minggu", "target.deep_work": "600 menit / minggu", "target.task_completion": "100% tepat waktu", "target.gym": "3× / minggu",
  "target.daily_steps": "6.000 / hari", "target.protein": "120 g / hari", "target.fruit_veg": "2 kali / hari", "target.expense_tracking": "100% tercatat",
  "target.skill_dev": "30 menit / hari", "target.competition": "2× / bulan", "target.project_completion": "1 / bulan", "target.professional_event": "1× / bulan",
  "target.networking": "5 / minggu", "target.reading": "10 halaman / hari", "target.journaling": "1 halaman / hari", "target.family_time": "2× / bulan",
  "target.helping_others": "3 / minggu", "target.friendship_followup": "2× / bulan", "target.relationship_followup": "2× / bulan",
  "target.laundry": "1× / minggu", "target.meal_planning": "1× / minggu", "target.everyDay": "setiap hari",
  "per.day": "hari", "per.week": "minggu", "per.month": "bulan",
  "unit.min": "menit", "unit.steps": "langkah", "unit.g": "g", "unit.sessions": "sesi", "unit.times": "kali", "unit.projects": "proyek",
  "unit.events": "acara", "unit.connections": "koneksi", "unit.acts": "aksi", "unit.day": "hari",
  "period.this.week": "minggu ini", "period.this.month": "bulan ini", "period.last.week": "minggu lalu", "period.last.month": "bulan lalu",
  "period.prev.week": "minggu sebelumnya", "period.prev.month": "bulan sebelumnya",
  "period.title.week": "Minggu ini", "period.title.month": "Bulan ini", "period.soFar": "{label} · hanya hari yang sudah lewat yang dihitung",
  "period.sub.week": "Performa Senin sampai Minggu", "period.sub.month": "Performa satu bulan kalender",
  "seg.week": "Minggu Ini", "seg.month": "Bulan Ini", "week.n": "Minggu {n}",
  "sec.domainsActs": "Domain & aktivitas", "sec.domainsHint": "Ketuk domain untuk melihat kontribusi tiap aktivitas.",
  "life.label": "Life Score", "life.noneBody": "Terus catat aktivitas harianmu. Begitu datanya cukup, Life Score akan muncul di sini.",
  "life.vs": "vs {prev}", "life.noPrev": "Belum cukup data sebelumnya.", "life.basedOn": "Berdasarkan {n} dari {total} aktivitas yang punya data.",
  "trend.improving": "Membaik", "trend.declining": "Menurun", "trend.stable": "Stabil", "trend.none": "Belum cukup data untuk menampilkan tren.",
  "detail.noData": "Belum ada data", "detail.daysRecorded": "{a} dari {b} hari tercatat", "detail.daysOnTarget": "{a} dari {b} hari mencapai target", "detail.target": "target {t}",
  "detail.weight": "bobot",
  "hl.strongest": "Area terkuat", "hl.attention": "Perlu perhatian", "hl.improve": "Peningkatan terbesar", "hl.decline": "Penurunan terbesar",
  "hl.noImprove": "Belum ada peningkatan besar", "hl.noDecline": "Tidak ada penurunan besar",
  "ins.primary": "Utama", "ins.show": "Lihat bukti", "ins.hide": "Sembunyikan bukti",
  "ins.none.title": "Belum cukup data", "ins.none.desc": "Catat beberapa aktivitas {period}, lalu AWWAB akan mulai menjelaskan apa yang terjadi.",
  "ins.domainDown": "{domain} turun {n} poin {period}.", "ins.domainUp": "{domain} naik {n} poin {period}.",
  "ins.contrib.one": "{names} paling berpengaruh.", "ins.contrib.many": "{names} paling berpengaruh.",
  "ins.compared": "Dibandingkan {prev}.",
  "ins.weakest": "{domain} adalah area terendahmu {period}, di angka {n}.", "ins.weakest.desc": "{act} ({p}) punya selisih berbobot terbesar di area ini.",
  "ins.weakest.descNone": "Aktivitas yang tercatat di area ini berada di bawah area lain.",
  "ins.recWeak": "{act} berada di bawah target selama tiga {units} berturut-turut.", "ins.recStrong": "{act} konsisten mencapai target selama tiga {units}.",
  "ins.units.week": "minggu", "ins.units.month": "bulan", "ins.targetDesc": "Target: {target}.",
  "ins.ev.current": "Sekarang: {p}", "ins.ev.ago1.week": "Minggu lalu: {p}", "ins.ev.ago2.week": "2 minggu lalu: {p}",
  "ins.ev.ago1.month": "Bulan lalu: {p}", "ins.ev.ago2.month": "2 bulan lalu: {p}",
  "ins.actDown": "Konsistensi {act} turun dari {a} ke {b}.", "ins.actUp": "Konsistensi {act} naik dari {a} ke {b}.",
  "ins.strongest": "{domain} adalah area terkuatmu {period}, di angka {n}.", "ins.strongest.desc": "Berdasarkan aktivitas yang kamu catat.",
  "ins.title": "Mengapa hasilnya seperti ini", "ins.subtitle": "Apa yang terjadi dan perilaku apa yang berkaitan. Setiap baris berasal dari datamu.",
  "daily.today": "Hari ini", "daily.future": "Hari ini belum terjadi. Catatan di sini belum dihitung sampai harinya tiba.",
  "daily.hint": "{n} dari {total} tercatat · ketuk sekali untuk selesai, dua kali untuk tidak, tiga kali untuk mengosongkan.",
  "check.done": "Selesai", "check.notDone": "Tidak", "check.none": "Kosong", "daily.inUnit": "{act} dalam {unit}",
  "daily.empty": "Belum ada kebiasaan aktif. Tambahkan di Pengaturan.",
  "greet.morning": "Selamat pagi", "greet.afternoon": "Selamat siang", "greet.evening": "Selamat sore", "greet.night": "Selamat malam",
  "home.start": "Mulai mencatat hari ini. Cukup satu sampai tiga menit.", "home.openTracker": "Buka pencatatan hari ini", "home.domains": "Domain",
  "home.happening": "Apa yang terjadi?", "home.allInsights": "Semua wawasan →", "home.monthTrend": "Bulan ini, per minggu",
  "home.nextFocus": "Fokus berikutnya", "home.chosenFocus": "Fokus pilihanmu", "home.due": "Tenggat {d}", "home.nothing": "Belum ada jadwal.", "home.setGoal": "Buat tujuan",
  "type.goal": "Tujuan", "type.project": "Proyek", "type.milestone": "Milestone",
  "goals.title": "Ke mana kamu menuju", "goals.subtitle": "Progres tujuan berasal dari proyek dan milestone — terpisah dari Life Score.",
  "filter.active": "Aktif", "filter.completed": "Selesai", "filter.archived": "Diarsipkan", "goals.new": "Tujuan baru",
  "goals.empty.active": "Belum ada tujuan aktif", "goals.empty.completed": "Belum ada tujuan yang selesai", "goals.empty.archived": "Tidak ada tujuan yang diarsipkan",
  "goals.emptyBody": "Tujuan berisi proyek, dan proyek berisi milestone. Mulailah dari satu hal yang penting.",
  "goals.titlePh": "Judul tujuan, mis. Bangun portofolio", "goals.whyPh": "Mengapa ini penting (opsional)", "goals.domain": "Domain", "goals.noDomain": "Tanpa domain",
  "goals.targetDate": "Tanggal target", "goals.create": "Buat tujuan", "goals.overdue": "Terlambat · ", "goals.target": "Target ",
  "goals.edit": "Ubah tujuan", "goals.archive": "Arsipkan tujuan", "goals.restore": "Pulihkan tujuan", "goals.noMilestones": "Belum ada milestone.",
  "goals.noProjects": "Belum ada proyek.", "goals.addProject": "Tambah proyek",
  "proj.titlePh": "Judul proyek", "proj.deadline": "Tenggat proyek", "proj.due": " · tenggat {d}", "proj.noMs": "Belum ada milestone",
  "proj.edit": "Ubah proyek", "proj.archive": "Arsipkan proyek", "proj.restore": "Pulihkan proyek",
  "status.not_started": "Belum dimulai", "status.in_progress": "Berjalan", "status.completed": "Selesai", "status.archived": "Diarsipkan",
  "status.pending": "Belum selesai", "status.active": "Aktif",
  "ms.complete": "Selesaikan {t}", "ms.edit": "Ubah {t}", "ms.delete": "Hapus {t}", "ms.confirmDelete": "Hapus milestone \"{t}\"? Ini tidak bisa dibatalkan.",
  "ms.add": "Tambah milestone", "ms.due": "Tenggat milestone", "ms.title": "Judul milestone",
  "review.eyebrow": "Review Bulanan", "review.subtitle": "Lihat ke belakang, pahami, renungkan, lalu melangkah.", "review.prevMonth": "Bulan sebelumnya",
  "review.noCompare": "Belum ada pembanding", "review.strongest": "Terkuat", "review.wentWell": "Yang berjalan baik", "review.strongestArea": "Area terkuat:",
  "review.improved": "{d} naik +{n} poin", "review.completedProject": "Proyek selesai:", "review.msCompleted": "{n} milestone selesai",
  "review.nothing": "Belum ada catatan untuk bulan ini.", "review.declined": "{d} turun {n} poin", "review.lowest": "Area terendah:",
  "review.overdueMs": "Milestone terlambat: {t} ({d})", "review.dueSoon": "{t} tenggat {d}", "review.nothingFlagged": "Tidak ada yang perlu ditandai.",
  "review.goals": "Tujuan", "review.noGoals": "Belum ada tujuan.", "col.goal": "Tujuan", "col.prev": "Sebelumnya", "col.cur": "Sekarang", "col.nextMs": "Milestone berikutnya",
  "review.reflection": "Refleksi", "review.q.wentWell": "Apa yang berjalan baik?", "review.q.difficult": "Apa yang sulit?",
  "review.q.change": "Apa yang perlu diubah bulan depan?", "review.q.stop": "Apa yang perlu dihentikan?", "review.q.continue": "Apa yang perlu dilanjutkan?",
  "review.focus": "Satu fokus saya bulan depan", "review.focusPh": "mis. Akademik, atau Selesaikan MVP AWWAB", "review.update": "Perbarui review",
  "review.save": "Simpan review", "review.past": "Review sebelumnya",
  "cal.subtitle": "Tanggal penting dari tujuan, proyek, dan milestone.", "cal.in": " · di {p}", "cal.open": "Buka di Tujuan",
  "cal.upcoming": "Akan datang", "cal.nothing": "Belum ada yang akan datang. Tambahkan tanggal pada tujuan, proyek, atau milestone.",
  "wd.0": "Sen", "wd.1": "Sel", "wd.2": "Rab", "wd.3": "Kam", "wd.4": "Jum", "wd.5": "Sab", "wd.6": "Min",
  "settings.subtitle": "Bahasa dan kebiasaan yang kamu catat.", "settings.language": "Bahasa",
  "settings.langHint": "Hanya tampilan yang berubah. Datamu tetap sama.",
  "habits.title": "Aktivitas & Kebiasaan", "habits.add": "Tambah Kebiasaan", "habits.edit": "Edit Kebiasaan", "habits.archive": "Arsipkan Kebiasaan", "habits.archiveShort": "Arsipkan",
  "habits.delete": "Hapus", "habits.reactivate": "Aktifkan Kembali", "habits.name": "Nama Kebiasaan", "habits.inputType": "Jenis Input",
  "input.checklist": "Checklist", "input.quantitative": "Angka", "habits.target": "Target", "habits.unit": "Satuan", "habits.unitPh": "mis. ml, menit, halaman",
  "habits.frequency": "Frekuensi", "freq.day": "Harian", "freq.week": "Mingguan", "freq.month": "Bulanan", "habits.weight": "Bobot (%)",
  "habits.save": "Simpan Kebiasaan", "habits.active": "Kebiasaan aktif", "habits.archived": "Diarsipkan", "habits.archivedOn": "Diarsipkan {d}",
  "habits.noArchived": "Belum ada kebiasaan yang diarsipkan.", "habits.weightWarn": "Total bobot aktivitas di {domain} adalah {n}%, bukan 100%.",
  "habits.rebalance": "Seimbangkan ke 100%",
  "habits.historyWarn": "Habits dengan data historis akan diarsipkan agar riwayat kamu tetap aman.",
  "habits.confirmDelete": "Hapus kebiasaan ini secara permanen?", "habits.err.name": "Isi nama kebiasaan.",
  "habits.err.target": "Target harus angka lebih dari 0.", "habits.err.weight": "Bobot harus antara 0 dan 100.",
  "habits.err.dup": "Kebiasaan dengan nama ini sudah ada di domain ini.",
  "habits.historyNote": "Perubahan berlaku mulai hari ini. Periode sebelumnya tetap memakai pengaturan lama.", "habits.custom": "Buatan sendiri",
  "habits.checkHint": "Untuk checklist harian, mencentang berarti target hari itu tercapai.",
};

const DICT: Record<Lang, Record<string, string>> = { en, id };

// ---------- language store ----------
const KEY = "awwab:lang";
let lang: Lang = "id";
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(KEY);
    if (v === "en" || v === "id") lang = v;
  } catch {
    /* storage unavailable */
  }
  document.documentElement.lang = lang;
}

export const getLang = (): Lang => {
  load();
  return lang;
};

export function setLang(l: Lang) {
  lang = l;
  try {
    window.localStorage.setItem(KEY, l);
  } catch {
    /* storage unavailable */
  }
  document.documentElement.lang = l;
  listeners.forEach((f) => f());
}

export const locale = () => (getLang() === "id" ? "id-ID" : "en-US");

export function useLang(): Lang {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    getLang,
    () => "id" as Lang,
  );
}

export function translate(l: Lang, key: string, p?: Params): string {
  let s = DICT[l][key] ?? DICT.en[key] ?? key;
  if (p) for (const [k, v] of Object.entries(p)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

export const hasKey = (key: string) => key in en;

export function useT(): T {
  const l = useLang();
  return useMemo(() => (k: string, p?: Params) => translate(l, k, p), [l]);
}

// ---------- display helpers (presentation only) ----------
export const domainName = (id: DomainId, t: T) => t(`domain.${id}`);

export const actName = (a: { id: string; isSystem: boolean; customName: string | null }, t: T) =>
  a.customName ?? (a.isSystem ? t(`act.${a.id}`) : a.id);

export const unitText = (u: string, t: T) => (hasKey(`unit.${u}`) ? t(`unit.${u}`) : u);

const num = (n: number) => n.toLocaleString(locale());

export function targetText(a: Activity, t: T): string {
  const d = SYSTEM_DEFAULTS[a.id];
  if (a.isSystem && d && d.target === a.target && d.frequency === a.frequency && d.inputType === a.inputType && d.unit === a.unit)
    return t(`target.${a.id}`);
  const per = t(`per.${a.frequency}`);
  if (a.inputType === "checklist") return a.frequency === "day" ? t("target.everyDay") : `${num(a.target)}× / ${per}`;
  return `${num(a.target)} ${unitText(a.unit, t)} / ${per}`;
}

export const joinNames = (names: string[], t: T) =>
  names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} ${t("common.and")} ${names[names.length - 1]}`;
