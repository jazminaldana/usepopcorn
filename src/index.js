import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from "./App";
// import StarRating from './StarRating';

// const Test = () => {
//   const [moveRating, setMovieRating] = React.useState(0);
//   return (
//     <>
//       <StarRating color='blue' maxRating={10} onSetRating={setMovieRating} />
//       <p>This movie was rated {moveRating} stars</p>
//     </>
//   );
// }

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating messages={['Terrible', 'Bad', 'Okay', 'Good', 'Great']} defaultRating={3} />
    <StarRating size={24} color="red" />
    <Test /> */}
  </React.StrictMode>
);

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
