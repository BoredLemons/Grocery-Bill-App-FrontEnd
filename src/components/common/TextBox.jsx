const TextBox = ({ error, handleOnTextChange, name, label, type, value }) => {
    return (
        <div className="mb-3">
            <label htmlFor={name} className="form-label">{label}</label>
            <input value={value} onChange={handleOnTextChange} name={name} type={type} className="form-control" id={name} />
            {error &&
                (<div className="alert alert-danger">
                    {error}
                </div>)
            }
        </div>
    )
}

export default TextBox;