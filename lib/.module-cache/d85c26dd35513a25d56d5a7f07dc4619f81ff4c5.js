import React from 'react';
import './Greater.css';

export default class Greater extends React.Component {
    render() {
        return (
            React.createElement("div", {className: "root"}, 
                "Hello World"
            )
        )
    }
}