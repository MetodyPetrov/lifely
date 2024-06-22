import { useState } from "react";

export default function FilterDropdown({ options, optionsHandlers, iconSelected = 0 }) {

    const icon = <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Z"/></svg>;
    const activeIcon = <svg className="active-box-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="m424-312 282-282-56-56-226 226-114-114-56 56 170 170ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/></svg>;

    const [ selectedIcon, setSelectedIcon ] = useState(iconSelected);

    function setSelected(iconIndex) {
        setSelectedIcon(iconIndex);
        if(optionsHandlers[iconIndex]) optionsHandlers[iconIndex]();
    }
    
    return (
        <div className="checkbox">
            <ul>
                {options.map((item, index) => (
                    <li className="checkbox-item" key={index}>
                        <span className="box-icon" onClick={() => setSelected(index)}>{selectedIcon === index ? activeIcon : icon}</span>
                        <h3>{options[index]}</h3>
                    </li>
                ))}
            </ul>
        </div>
    );
}