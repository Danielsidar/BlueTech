export const getLocalized = (obj: any, field: string, lng: string) => {
  if (!obj) return '';
  // If the object has the direct field (new structure), use it
  if (obj[field] !== undefined) return obj[field];
  
  // Fallback for old structure or specialized fields
  const baseLng = lng.split('-')[0];
  return obj[`${field}_${baseLng}`] || obj[`${field}_he`] || obj[field] || '';
};

export const filterByVisibility = (items: any[], lng: string) => {
  if (!items) return [];
  const baseLng = lng.split('-')[0];
  
  return items.filter(item => {
    // If it has a language field (new structure), filter by it
    if (item.language) {
      return item.language === baseLng || item.language === lng;
    }
    // Fallback for old structure with visibility array
    if (item.visibility) {
      return item.visibility.includes(baseLng) || item.visibility.includes(lng);
    }
    // If no language/visibility, show by default
    return true;
  });
};
