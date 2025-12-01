// src/pages/DashboardPages/MySkills.jsx
export default function MySkills({ profileData, darkMode }) {
  const colors = darkMode
    ? { text: 'text-white', cardBg: 'bg-gray-800', border: 'border-gray-700', textMuted: 'text-gray-400' }
    : { text: 'text-slate-900', cardBg: 'bg-white', border: 'border-slate-200', textMuted: 'text-slate-600' };

  return (
    <div className={`${colors.cardBg} rounded-2xl border ${colors.border} p-8 shadow-lg`}>
      <h2 className={`text-3xl font-extrabold ${colors.text} mb-6`}>My Skills</h2>
      
      {profileData?.skills ? (
        <div className="space-y-3">
          <p className={`${colors.textMuted} mb-4`}>Your listed skills:</p>
          <div className="flex flex-wrap gap-3">
            {profileData.skills.split(',').map((skill, idx) => (
              <span key={idx} className="bg-green-500 text-white px-4 py-2 rounded-full font-semibold">
                {skill.trim()}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className={colors.textMuted}>No skills added yet. Add your first skill!</p>
      )}
      
      <button className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition">
        + Add Skill
      </button>
    </div>
  );
}