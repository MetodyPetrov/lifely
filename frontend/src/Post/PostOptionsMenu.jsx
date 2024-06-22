export default function PostOptionsMenu({ optionsTitle, menuElements, deletePost }) {
    return (
    <div className="dropdown">
        <h2>{optionsTitle}</h2>
        <ul> 
            {menuElements && menuElements.map((item, index) => (
                <li key={index}><button onClick={item === 'Delete' ? deletePost : undefined}>{item}</button></li>
            ))}
        </ul>
    </div>
    );
}