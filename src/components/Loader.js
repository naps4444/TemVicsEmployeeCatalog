import { PropagateLoader } from "react-spinners";

function Loader() {
  return (
    <div className="flex justify-center items-center py-20">
      <PropagateLoader color="#306cce" size={15} />
    </div>
  );
}

export default Loader;
