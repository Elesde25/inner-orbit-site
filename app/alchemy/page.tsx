import AlchemyExperience from "@/components/alchemy/AlchemyExperience";
import CosmicAtmosphere from "@/components/alchemy/CosmicAtmosphere";
import "./alchemy.css";
export const metadata={title:"Inner Alchemy — Inner Orbit"};
export default function AlchemyPage(){return <div className="al-root"><CosmicAtmosphere/><div className="al-content"><AlchemyExperience/></div></div>}
