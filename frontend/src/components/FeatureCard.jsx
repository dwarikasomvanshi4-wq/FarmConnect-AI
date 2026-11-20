function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 text-center hover:shadow-xl transition duration-300">

      <div className="text-4xl sm:text-5xl mb-4">
        {icon}
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-gray-800">
        {title}
      </h3>

      <p className="mt-3 text-sm sm:text-base text-gray-600">
        {description}
      </p>

    </div>
  );
}

export default FeatureCard;