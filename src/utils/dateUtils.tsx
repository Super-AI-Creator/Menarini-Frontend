// utils/dateUtils.ts
export const parseCustomDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    
    // Handle formats like "Sun, 04 May 2025"
    const months: Record<string, number> = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };
  
    const parts = dateString.replace(',', '').split(' ');
    if (parts.length === 4) { // "Sun 04 May 2025"
      const [, day, month, year] = parts;
      return new Date(parseInt(year), months[month], parseInt(day));
    }
    
    return null;
  };