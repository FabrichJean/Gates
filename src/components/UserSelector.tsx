import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// USER AUTOCOMPLETE SELECTOR - ENTERPRISE GRADE
// ═══════════════════════════════════════════════════════════════════════════════

export type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  isValidated: boolean;
  isDeleted: boolean;
};

interface UserSelectorProps {
  users: User[];
  selectedUserId?: number | null;
  onSelect: (user: User | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxHeight?: number;
  showValidationBadge?: boolean;
  allowClear?: boolean;
}

// ───────────────────────────────────────────────────────────────────────────────
// Icon System
// ───────────────────────────────────────────────────────────────────────────────

const Icon: React.FC<{ name: string; className?: string; size?: number }> = ({ 
  name, className = '', size = 16 
}) => {
  const icons: Record<string, React.ReactNode> = {
    search: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
    user: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20,6 9,17 4,12"/>
      </svg>
    ),
    close: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
    chevronDown: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6,9 12,15 18,9"/>
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    warning: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    mail: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    spinner: (
      <svg viewBox="0 0 24 24" fill="none" className="animate-spin">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2"/>
        <path fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z"/>
      </svg>
    ),
  };

  return (
    <span className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {icons[name] || null}
    </span>
  );
};

// ───────────────────────────────────────────────────────────────────────────────
// User Avatar Component
// ───────────────────────────────────────────────────────────────────────────────

const UserAvatar: React.FC<{ username: string; size?: 'sm' | 'md' | 'lg' }> = ({ username, size = 'md' }) => {
  const initials = username.slice(0, 2).toUpperCase();
  const hue = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;

  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  };

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ backgroundColor: `hsl(${hue}, 65%, 45%)` }}
    >
      {initials}
    </div>
  );
};

// ───────────────────────────────────────────────────────────────────────────────
// Validation Badge
// ───────────────────────────────────────────────────────────────────────────────

const ValidationBadge: React.FC<{ isValidated: boolean; isDeleted: boolean }> = ({ 
  isValidated, 
  isDeleted 
}) => {
  if (isDeleted) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700 border border-red-200">
        <Icon name="warning" size={10} />
        Deleted
      </span>
    );
  }

  if (isValidated) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
        <Icon name="shield" size={10} />
        Verified
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200">
      <Icon name="warning" size={10} />
      Pending
    </span>
  );
};

// ───────────────────────────────────────────────────────────────────────────────
// Role Badge
// ───────────────────────────────────────────────────────────────────────────────

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    moderator: 'bg-blue-100 text-blue-700 border-blue-200',
    user: 'bg-slate-100 text-slate-600 border-slate-200',
    guest: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  const colorClass = roleColors[role.toLowerCase()] || roleColors.user;

  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border capitalize ${colorClass}`}>
      {role}
    </span>
  );
};

// ───────────────────────────────────────────────────────────────────────────────
// Main Component
// ───────────────────────────────────────────────────────────────────────────────

export const UserSelector: React.FC<UserSelectorProps> = ({
  users,
  selectedUserId,
  onSelect,
  placeholder = 'Search user...',
  disabled = false,
  className = '',
  maxHeight = 320,
  showValidationBadge = true,
  allowClear = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedUser = useMemo(() => 
    users.find(u => u.id === selectedUserId) || null,
    [users, selectedUserId]
  );

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users.filter(u => !u.isDeleted);

    const query = searchQuery.toLowerCase();
    return users
      .filter(u => !u.isDeleted)
      .filter(u => 
        u.username.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.role.toLowerCase().includes(query)
      )
      .sort((a, b) => {
        // Prioritize exact matches and validated users
        const aExact = a.username.toLowerCase() === query;
        const bExact = b.username.toLowerCase() === query;
        if (aExact && !bExact) return -1;
        if (bExact && !aExact) return 1;
        if (a.isValidated && !b.isValidated) return -1;
        if (b.isValidated && !a.isValidated) return 1;
        return a.username.localeCompare(b.username);
      });
  }, [users, searchQuery]);

  // Reset highlight when filter changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredUsers.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredUsers[highlightedIndex]) {
          onSelect(filteredUsers[highlightedIndex]);
          setIsOpen(false);
          setSearchQuery('');
        }
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  }, [isOpen, filteredUsers, highlightedIndex, onSelect]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlightedEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedEl) {
        highlightedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = useCallback((user: User) => {
    onSelect(user);
    setIsOpen(false);
    setSearchQuery('');
  }, [onSelect]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
    setSearchQuery('');
    inputRef.current?.focus();
  }, [onSelect]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger / Input Field */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          relative flex items-center gap-3 w-full px-3 py-2.5
          bg-white border rounded-lg cursor-pointer
          transition-all duration-200 ease-out
          ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:border-slate-400'}
          ${isOpen 
            ? 'border-blue-500 ring-2 ring-blue-100 shadow-sm' 
            : 'border-slate-200'
          }
        `}
      >
        {selectedUser ? (
          <>
            <UserAvatar username={selectedUser.username} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-800 truncate">
                  {selectedUser.username}
                </span>
                {showValidationBadge && (
                  <ValidationBadge 
                    isValidated={selectedUser.isValidated} 
                    isDeleted={selectedUser.isDeleted} 
                  />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Icon name="mail" size={12} />
                <span className="truncate">{selectedUser.email}</span>
              </div>
            </div>
            {allowClear && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Icon name="close" size={16} />
              </button>
            )}
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Icon name="user" size={16} className="text-slate-400" />
            </div>
            <span className="flex-1 text-sm text-slate-400">{placeholder}</span>
          </>
        )}

        <Icon 
          name="chevronDown" 
          size={16} 
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="
            absolute z-50 w-full mt-1
            bg-white border border-slate-200 rounded-lg shadow-lg
            animate-in fade-in slide-in-from-top-1 duration-150
          "
          style={{ maxHeight }}
        >
          {/* Search Header */}
          <div className="sticky top-0 bg-white border-b border-slate-100 p-2 z-10">
            <div className="relative">
              <Icon 
                name="search" 
                size={16} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" 
              />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or role..."
                className="
                  w-full pl-9 pr-3 py-2 text-sm
                  bg-slate-50 border border-slate-200 rounded-md
                  placeholder:text-slate-400
                  focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                  transition-all duration-150
                "
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); inputRef.current?.focus(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-[11px] text-slate-500">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>

          {/* User List */}
          <div 
            ref={listRef}
            className="overflow-y-auto p-1 space-y-0.5"
            style={{ maxHeight: maxHeight - 100 }}
          >
            {filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Icon name="search" size={20} className="text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-700">No users found</p>
                <p className="text-xs text-slate-500 mt-1">
                  Try adjusting your search terms
                </p>
              </div>
            ) : (
              filteredUsers.map((user, index) => {
                const isHighlighted = index === highlightedIndex;
                const isSelected = selectedUser?.id === user.id;

                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelect(user)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-md
                      text-left transition-all duration-100
                      ${isHighlighted || isSelected
                        ? 'bg-blue-50 border border-blue-100' 
                        : 'hover:bg-slate-50 border border-transparent'
                      }
                      ${isSelected ? 'ring-1 ring-blue-200' : ''}
                    `}
                  >
                    <UserAvatar username={user.username} size="md" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium truncate ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                          {user.username}
                        </span>
                        {showValidationBadge && (
                          <ValidationBadge 
                            isValidated={user.isValidated} 
                            isDeleted={user.isDeleted} 
                          />
                        )}
                        {isSelected && (
                          <Icon name="check" size={14} className="text-blue-600 flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500 truncate">{user.email}</span>
                        <span className="text-slate-300">·</span>
                        <RoleBadge role={user.role} />
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-3 py-2 rounded-b-lg">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Use ↑↓ to navigate, Enter to select</span>
              <span className="hidden sm:inline">ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSelector;
