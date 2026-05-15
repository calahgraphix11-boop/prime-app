import { useNavigate, useLocation } from "react-router-dom";
import UpgradeModal from "../components/UpgradeModal";

export default function Upgrade() {
  const navigate = useNavigate();
  const location = useLocation();
  const plan = new URLSearchParams(location.search).get("plan");

  return (
    <UpgradeModal
      defaultPlan={plan === "basic" || plan === "pro" ? plan : null}
      onClose={() => navigate("/")}
    />
  );
}
