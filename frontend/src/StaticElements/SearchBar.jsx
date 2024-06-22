import { useRef, useEffect, useState } from "react";
import FilterDropdown from "./FilterDropdown";

export default function SearchBar({ posts, setPosts, filterShow }) {
    const [ originalPosts, setOriginalPosts ] = useState(posts);

    const [ search, setSearch ] = useState('');
    
    const postsRef = useRef(posts);
    postsRef.current = posts;
    const searchRef = useRef(search);
    searchRef.current = search;

    const [ filterMode, setFilterMode ] = useState('title');

    const [ dropdown, setDropdown ] = useState(false);

    function dateMatches(date1, date2) {
        for (let i = 0; i < Math.min(date1.length, date2.length); i++) {
            if(date1[i] !== date2[i]) return false;
        };        
        return true;
    }
    useEffect(() => {
        return () => searchRef.current && postsRef.current && setPosts(posts);// NOTE: THE CLEANUP FUNCTION EXECUTES WITH INITIAL STATE VALUES ONLY FOR SOME REASON, A.K.A originalPosts = posts, search = '', filterMode = 'title', dropdown = 'false'
    }, []);
    useEffect(() => setDropdown(false), [filterShow]);
    useEffect(() => {
        if(originalPosts && !search) setPosts(originalPosts);
        if(!originalPosts) return;

        filterMode === 'title' && setPosts(() => originalPosts.filter(post => post.title.toLowerCase().includes(search.toLowerCase())));
        filterMode === 'user' && setPosts(() => originalPosts.filter(post => post.uploadedBy.toLowerCase().includes(search.toLowerCase())));
        filterMode === 'date' && setPosts(() => originalPosts.filter(post => dateMatches(search, post.date)));

    }, [filterMode, search]);
    
    return (
        <div className="search-bar">
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#5f6368"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>
            <input className="search-field" placeholder="Search Post" onChange={(e) => setSearch(e.target.value)}></input>
            <button className="filter-icon-button" onClick={() => setDropdown(!dropdown)}><svg className="filter-icon" xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#5f6368"><path d="M400-240v-80h160v80H400ZM240-440v-80h480v80H240ZM120-640v-80h720v80H120Z"/></svg></button>            
            { dropdown && <FilterDropdown 
                options={["Title", "Account", "Upload Date"]} 
                optionsHandlers={[() => setFilterMode('title'), () => setFilterMode('user'), () => setFilterMode('date')]}
                iconSelected={filterMode === 'title' ? 0 : filterMode === 'user' ? 1 : 2}/> 
            }
        </div>
    );
}