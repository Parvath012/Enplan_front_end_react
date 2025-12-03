export interface Country {
  name: string;
  code: string;
  states: string[];
}

export interface State {
  name: string;
  country: string;
}

const countriesStates = {
  countries: [
    { name: 'United States', code: 'US', states: ['California', 'New York', 'Texas', 'Florida', 'Illinois'] },
    { name: 'Canada', code: 'CA', states: ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba'] },
    { name: 'United Kingdom', code: 'UK', states: ['England', 'Scotland', 'Wales', 'Northern Ireland'] },
    { name: 'Australia', code: 'AU', states: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia'] },
    { name: 'Germany', code: 'DE', states: ['Bavaria', 'Berlin', 'Hamburg', 'North Rhine-Westphalia', 'Baden-Württemberg'] },
    { name: 'France', code: 'FR', states: ['Île-de-France', 'Provence-Alpes-Côte d\'Azur', 'Auvergne-Rhône-Alpes'] },
    { name: 'Japan', code: 'JP', states: ['Tokyo', 'Osaka', 'Kyoto', 'Hokkaido', 'Fukuoka'] },
    { name: 'India', code: 'IN', states: ['Maharashtra', 'Uttar Pradesh', 'Karnataka', 'Tamil Nadu', 'Gujarat'] }
  ],
  states: [
    { name: 'California', country: 'United States' },
    { name: 'New York', country: 'United States' },
    { name: 'Texas', country: 'United States' },
    { name: 'Florida', country: 'United States' },
    { name: 'Illinois', country: 'United States' },
    { name: 'Ontario', country: 'Canada' },
    { name: 'Quebec', country: 'Canada' },
    { name: 'British Columbia', country: 'Canada' },
    { name: 'Alberta', country: 'Canada' },
    { name: 'Manitoba', country: 'Canada' },
    { name: 'England', country: 'United Kingdom' },
    { name: 'Scotland', country: 'United Kingdom' },
    { name: 'Wales', country: 'United Kingdom' },
    { name: 'Northern Ireland', country: 'United Kingdom' },
    { name: 'New South Wales', country: 'Australia' },
    { name: 'Victoria', country: 'Australia' },
    { name: 'Queensland', country: 'Australia' },
    { name: 'Western Australia', country: 'Australia' },
    { name: 'South Australia', country: 'Australia' },
    { name: 'Bavaria', country: 'Germany' },
    { name: 'Berlin', country: 'Germany' },
    { name: 'Hamburg', country: 'Germany' },
    { name: 'North Rhine-Westphalia', country: 'Germany' },
    { name: 'Baden-Württemberg', country: 'Germany' },
    { name: 'Île-de-France', country: 'France' },
    { name: 'Provence-Alpes-Côte d\'Azur', country: 'France' },
    { name: 'Auvergne-Rhône-Alpes', country: 'France' },
    { name: 'Tokyo', country: 'Japan' },
    { name: 'Osaka', country: 'Japan' },
    { name: 'Kyoto', country: 'Japan' },
    { name: 'Hokkaido', country: 'Japan' },
    { name: 'Fukuoka', country: 'Japan' },
    { name: 'Maharashtra', country: 'India' },
    { name: 'Uttar Pradesh', country: 'India' },
    { name: 'Karnataka', country: 'India' },
    { name: 'Tamil Nadu', country: 'India' },
    { name: 'Gujarat', country: 'India' }
  ]
};

export default countriesStates;
