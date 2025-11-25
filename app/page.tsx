import { redirect } from "next/navigation";
import "./homepage.css";

export default function Home() {
  redirect("/recommendations");
}
