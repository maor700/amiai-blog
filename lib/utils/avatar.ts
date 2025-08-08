export function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function getAvatarColor(name: string): { bgColor: string; textColor: string; hexColor: string } {
  const colors = [
    { bg: 'bg-blue-400', text: 'text-white', hex: '#60a5fa' },
    { bg: 'bg-green-400', text: 'text-white', hex: '#4ade80' },
    { bg: 'bg-amber-400', text: 'text-gray-800', hex: '#fbbf24' },
    { bg: 'bg-purple-400', text: 'text-white', hex: '#a78bfa' },
    { bg: 'bg-pink-400', text: 'text-white', hex: '#f472b6' },
    { bg: 'bg-indigo-400', text: 'text-white', hex: '#818cf8' },
    { bg: 'bg-red-400', text: 'text-white', hex: '#f87171' },
    { bg: 'bg-orange-400', text: 'text-white', hex: '#fb923c' },
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const selectedColor = colors[Math.abs(hash) % colors.length];
  return {
    bgColor: selectedColor.bg,
    textColor: selectedColor.text,
    hexColor: selectedColor.hex
  };
}

export function getGravatarUrl(email: string | undefined, size: number = 80): string {
  if (!email || email === 'anonymous@example.com') {
    return `https://www.gravatar.com/avatar/anonymous?s=${size}&d=identicon`;
  }
  
  const crypto = require('crypto');
  const hash = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}