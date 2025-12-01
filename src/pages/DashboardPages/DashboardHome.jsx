// src/pages/DashboardPages/DashboardHome.jsx
import { Users, Zap, Compass, Trophy, PlusCircle, MapPin } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, darkMode }) => {
  const cardClasses = darkMode
    ? 'bg-gray-800 border-gray-700 text-white hover:shadow-green-900/50'
    : 'bg-white border-slate-200 text-slate-900 hover:shadow-green-200/50';

  return (
    <div className={`rounded-2xl p-6 border ${cardClasses} hover:shadow-lg transition transform hover:-translate-y-0.5`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
      <p className="text-slate-600 dark:text-gray-400 text-sm mb-1 uppercase tracking-wider font-semibold">{label}</p>
      <p className="text-3xl font-extrabold">{value}</p>
    </div>
  );
};

const QuickAction = ({ title, description, buttonText, onClick, icon: Icon, gradient, darkMode }) => {
  const buttonClass = darkMode 
    ? "bg-white text-lg text-gray-800 hover:bg-gray-100" 
    : "bg-white text-lg text-green-700 hover:bg-gray-50";

  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition transform hover:scale-[1.01]`}>
      <div className="flex items-center gap-4 mb-4">
        <Icon size={30} />
        <h3 className="text-3xl font-bold">{title}</h3>
      </div>
      <p className="text-white/80 mb-6">{description}</p>
      <button
        onClick={onClick}
        className={`${buttonClass} px-6 py-2 rounded-full hover:opacity-90 transition font-extrabold shadow-md`}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default function DashboardHome({ profileData, neighborhood, darkMode }) {
  const colors = darkMode
    ? { text: 'text-white', cardBg: 'bg-gray-800', border: 'border-gray-700', textMuted: 'text-gray-400' }
    : { text: 'text-slate-900', cardBg: 'bg-white', border: 'border-slate-200', textMuted: 'text-slate-600' };

  const primaryAccent = 'from-emerald-500 to-green-600';
  const secondaryAccent = 'from-blue-600 to-blue-700';

  // Count skills from comma-separated string
  const skillCount = profileData?.skills ? profileData.skills.split(',').filter(s => s.trim()).length : 0;

  const handleAddSkill = () => console.log('Add Skill clicked');
  const handleFindSkills = () => console.log('Find Skills clicked');

  const neighborhoodName = neighborhood?.neighborhood_name || 'Unknown Neighborhood';

  return (
    <>
      <h2 className={`text-3xl font-extrabold ${colors.text} mb-6`}>Overview</h2>
      
      {/* Neighborhood Card */}
      <div className={`${colors.cardBg} rounded-xl p-4 mb-6 border ${colors.border} flex items-center gap-3 shadow-md`}>
        <MapPin size={20} className="text-green-600" />
        <div>
          <p className={`text-sm ${colors.textMuted}`}>Your Neighborhood</p>
          <p className={`font-bold ${colors.text}`}>{neighborhoodName}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <StatCard 
          label="Skills Offered" 
          value={skillCount} 
          icon={Trophy} 
          color={primaryAccent} 
          darkMode={darkMode}
        />
        <StatCard 
          label="Requests Pending" 
          value="0" 
          icon={Compass} 
          color="from-amber-500 to-amber-600" 
          darkMode={darkMode}
        />
        <StatCard 
          label="Reputation Score" 
          value="5.0" 
          icon={Zap} 
          color="from-purple-500 to-purple-600" 
          darkMode={darkMode}
        />
        <StatCard 
          label="Neighbors Connected" 
          value="0" 
          icon={Users} 
          color={secondaryAccent} 
          darkMode={darkMode}
        />
      </div>
      
      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <QuickAction
          title="Teach a Skill"
          description="Offer a skill you have to a neighbor and start earning reputation."
          buttonText="List My Skill"
          onClick={handleAddSkill}
          icon={PlusCircle}
          gradient="from-blue-600 to-indigo-600"
          darkMode={darkMode}
        />
        <QuickAction
          title="Find a Skill"
          description="Look for skills you need right now in your local area."
          buttonText="Browse Skills"
          onClick={handleFindSkills}
          icon={Users}
          gradient="from-pink-500 to-red-500"
          darkMode={darkMode}
        />
      </div>
    </>
  );
}