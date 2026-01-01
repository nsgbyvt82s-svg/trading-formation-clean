export const metadata = {
  title: 'Équipe | DiamondTrade',
  description: "L'équipe derrière DiamondTrade",
};

export default function CreditsPage() {
  const team = [
    {
      name: '1Compris',
      role: 'Fondateur',
      discord: '@1compris.',
      avatar: '/images/Design_sans_titre_19.png',
    },
    {
      name: 'Vexx',
      role: 'Développeur',
      discord: '@wrqzn',
      avatar: '/images/vexx.jpg',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">
            L'Équipe
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Rencontrez l'équipe derrière DiamondTrade
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {team.map((member) => (
            <div 
              key={member.name}
              className="bg-gray-900 rounded-lg p-6 flex items-center space-x-6 border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <img 
                src={member.avatar} 
                alt={member.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-700"
              />
              <div>
                <h3 className="text-xl font-semibold text-white">{member.name}</h3>
                <p className="text-blue-400 mb-2">{member.role}</p>
                <div className="flex items-center text-sm text-gray-400">
                  <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25-1.47-.22-2.93-.22-4.37 0-.164-.386-.4-.875-.609-1.25a.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.098 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.1 13.107 13.107 0 01-1.872-2.767.076.076 0 01.041-.105c.412-.125.827-.24 1.245-.346a.077.077 0 01.078.02 10.2 10.2 0 001.69 1.83.076.076 0 00.1 0 13.301 13.301 0 007.17-7.18.076.076 0 00-.1-.1 10.2 10.2 0 01-1.832 1.69.077.077 0 01-.02.078c.106.418.22.834.346 1.246a.076.076 0 00.105.041 13.1 13.1 0 012.768-1.873.076.076 0 00.1-.04c.72-1.49 1.04-3.11 1.04-4.75a.077.077 0 00-.111-.07 7.5 7.5 0 01-2.18.55.077.077 0 01-.083-.028c-.63-.76-1.47-1.36-2.42-1.75a.076.076 0 01-.04-.1 9.1 9.1 0 01.6-1.06.077.077 0 00.007-.09 6.1 6.1 0 01-.92-3.13zM8.02 16.14c-.05 0-.1.02-.13.07a.075.075 0 00.01.09 1.5 1.5 0 001.09.54c.06 0 .1-.02.13-.07a.075.075 0 00-.01-.09 1.5 1.5 0 00-1.09-.54zm2.44 2.44c-.05 0-.1.02-.13.07a.075.075 0 00.01.09 3.5 3.5 0 002.54 1.26c.06 0 .1-.02.13-.07a.075.075 0 00-.01-.09 3.5 3.5 0 00-2.54-1.26z" />
                  </svg>
                  {member.discord}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} DiamondTrade. Tous droits réservés.
        </div>
      </div>
    </div>
  );
}
