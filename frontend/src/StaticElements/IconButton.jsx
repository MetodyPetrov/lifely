export default function IconButton({ isSelected, isFirst, isLast, setSelected, icon }) {

    let cssClasses = "not-selected";

    if(isSelected) {
        cssClasses = "selected ";
        if(isFirst) cssClasses += "selected-first";
        else if(isLast) cssClasses += "selected-last";
        else cssClasses = "selected selected-first selected-last";
    }

    return (
    <button className={cssClasses} onClick={setSelected}>
        {icon}
    </button>
    );
}