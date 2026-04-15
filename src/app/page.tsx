import { AuraHomeExperience } from "@/components/aura/AuraHomeExperience";
import { FirebaseProvider } from "@/components/firebase/FirebaseProvider";

export default function Home() {
  return (
    <FirebaseProvider>
      <AuraHomeExperience />
    </FirebaseProvider>
  );
}
