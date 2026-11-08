'use client';
import { useEffect, useState } from 'react';
export function ThemeSelect() {
 const [theme,setTheme]=useState('system');
 useEffect(()=>{const saved=localStorage.getItem('punchline-theme'); if(saved && ['dark','light','system'].includes(saved)){setTheme(saved); document.documentElement.dataset.consoleTheme=saved;}},[]);
 return <label className="theme-picker">Appearance<select aria-label="Appearance" value={theme} onChange={e=>{setTheme(e.target.value);localStorage.setItem('punchline-theme',e.target.value);document.documentElement.dataset.consoleTheme=e.target.value;}}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>;
}
