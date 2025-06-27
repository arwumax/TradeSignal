export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(new Date(dateString));
};

export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  // Convert both dates to Eastern Time for accurate day comparison
  const dateET = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const nowET = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  
  // Calculate difference in days using Eastern Time
  const startOfDateET = new Date(dateET.getFullYear(), dateET.getMonth(), dateET.getDate());
  const startOfNowET = new Date(nowET.getFullYear(), nowET.getMonth(), nowET.getDate());
  
  const diffTime = Math.abs(startOfNowET.getTime() - startOfDateET.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZoneName: 'short'
  }).format(date);
};

export const formatDateForMeta = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-CA', {
    timeZone: 'America/New_York'
  }); // Returns YYYY-MM-DD format in Eastern Time
};