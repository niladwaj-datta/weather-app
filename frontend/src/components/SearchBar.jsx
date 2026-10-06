import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Loader2 } from 'lucide-react';

const POPULAR_CITIES = ['Tokyo', 'New York', 'London', 'Paris', 'Sydney', 'Dubai', 'Mumbai'];

export default function SearchBar({ onSearch, isLoading }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Debounced autocomplete suggestions
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsSearchingSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingSuggestions(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.results || []);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      onSearch(query.trim());
    }
  };

  const handleSelectSuggestion = (city) => {
    const fullName = city.region ? `${city.name}, ${city.region}, ${city.country}` : `${city.name}, ${city.country}`;
    setQuery(city.name);
    setShowDropdown(false);
    onSearch(city.name);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div className="search-section" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="search-input-wrapper">
        <Search size={20} className="search-icon-left" />
        <input
          type="text"
          className="search-input"
          placeholder="Search city (e.g., Tokyo, London, San Francisco)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          disabled={isLoading}
        />
        <div className="search-actions-right">
          {isSearchingSuggestions && (
            <Loader2 size={18} className="animate-spin text-muted" style={{ animation: 'spin 1s linear infinite' }} />
          )}
          {query && !isLoading && (
            <button
              type="button"
              className="icon-action-btn"
              style={{ width: '28px', height: '28px', border: 'none' }}
              onClick={handleClear}
              title="Clear"
            >
              <X size={16} />
            </button>
          )}
          <button type="submit" className="search-btn" title="Search weather" disabled={isLoading}>
            {isLoading ? (
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Search size={18} />
            )}
          </button>
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="autocomplete-dropdown">
          {suggestions.map((item, index) => (
            <div
              key={`${item.latitude}-${item.longitude}-${index}`}
              className="suggestion-item"
              onClick={() => handleSelectSuggestion(item)}
            >
              <MapPin size={16} style={{ color: '#38bdf8', flexShrink: 0 }} />
              <div>
                <span className="suggestion-name">{item.name}</span>
                <span className="suggestion-detail">
                  {item.region ? ` • ${item.region}` : ''} {item.country ? ` • ${item.country}` : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick City Pills */}
      <div className="quick-chips">
        {POPULAR_CITIES.map((city) => (
          <button
            key={city}
            type="button"
            className="chip-btn"
            onClick={() => {
              setQuery(city);
              onSearch(city);
            }}
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  );
}

