import React from "react";
import { Link } from "react-router-dom";
import Mountain1 from "../assets/mountain.jpg";
import Mountain2 from "../assets/mountain2.jpg";
import Mountain3 from "../assets/mountain3.jpg";

// Hotel Data
const hotels = [
  {
    id: 1,
    name: "Mountain Lodge",
    location: "Everest Base Camp",
    price: "$50/night",
    image: Mountain1,
  },
  {
    id: 2,
    name: "Everest View Retreat",
    location: "Lukla, Nepal",
    price: "$75/night",
    image: Mountain2,
  },
  {
    id: 3,
    name: "Himalayan Paradise",
    location: "Annapurna Base Camp",
    price: "$90/night",
    image: Mountain3,
  }
];

const Home = () => {
  return (
    <div className="bg-gray-100">
      {/* Hero Section */}
      <div className="relative w-full h-[80vh]">
        <img src={Mountain1} alt="Mountain Hotel" className="w-full h-full object-cover brightness-75" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white">
          <h1 className="text-5xl font-extrabold">Find Your Perfect Trek Hotel</h1>
          <p className="text-lg mt-4">Stay near the best trekking routes in Nepal</p>
          <Link to="/search" className="mt-6 bg-yellow-500 px-6 py-3 rounded-lg text-xl font-semibold shadow-md hover:bg-yellow-600 transition">
            Search Hotels
          </Link>
        </div>
      </div>

      {/* Search Bar
      <div className="bg-white shadow-md rounded-lg p-4 max-w-3xl mx-auto -mt-12 relative z-10 flex justify-between items-center">
        <input type="text" placeholder="Search by location..." className="w-full p-3 border rounded-md" />
        <Link to="/search" className="ml-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          Search
        </Link>
      </div> */}

      {/* Featured Hotels */}
      <div className="py-12 px-6">
        <h2 className="text-3xl font-bold text-center">Featured Hotels</h2>
        <p className="text-center text-gray-600 mt-2">Handpicked stays near Nepal’s best trekking trails</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
              <img src={hotel.image} alt={hotel.name} className="w-full h-56 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-bold">{hotel.name}</h3>
                <p className="text-gray-600">{hotel.location}</p>
                <p className="text-gray-800 font-semibold mt-2">{hotel.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-blue-600 text-white py-12 text-center">
        <h2 className="text-3xl font-bold">Why Choose Hotel Trek Advisor?</h2>
        <p className="mt-3 text-lg">Your best companion for comfortable stays near trekking routes.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-6">
          <div className="bg-white text-blue-600 p-6 rounded-lg shadow-md max-w-sm">
            <h3 className="text-xl font-bold">Trekking-Focused Hotels</h3>
            <p className="mt-2 text-gray-700">Stay near major trekking routes with top facilities.</p>
          </div>
          <div className="bg-white text-blue-600 p-6 rounded-lg shadow-md max-w-sm">
            <h3 className="text-xl font-bold">Affordable Pricing</h3>
            <p className="mt-2 text-gray-700">Find budget-friendly accommodations that suit your needs.</p>
          </div>
          <div className="bg-white text-blue-600 p-6 rounded-lg shadow-md max-w-sm">
            <h3 className="text-xl font-bold">Verified Reviews</h3>
            <p className="mt-2 text-gray-700">Read real traveler reviews before booking.</p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold">Plan Your Trek with Confidence</h2>
        <p className="text-gray-600 mt-2">Find hotels, guides, and meals for a perfect adventure</p>
        <Link to="/search" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg text-xl font-semibold shadow-md hover:bg-blue-700 transition">
          Explore More Hotels
        </Link>
      </div>
    </div>
  );
};

export default Home;
