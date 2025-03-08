import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import './ContactPage.css'; // Importez le fichier CSS

const supabaseUrl = "https://lvdvmqdtzqzuzppnjhvj.supabase.co"; 
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2ZHZtcWR0enF6dXpwcG5qaHZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxNjkwMzksImV4cCI6MjA1NTc0NTAzOX0.H0v-0n9lqDRCdxPtWRUcKVsPZTkk36iOOayuFgGAzXA";
const supabase = createClient(supabaseUrl, supabaseKey);

function ContactPage() {
  const [contact, setContact] = useState([]);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginFormVisible, setIsLoginFormVisible] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchContact = async () => {
      const { data, error } = await supabase.from("contact").select("*");
      if (error) {
        console.error("Erreur lors de la récupération du contact", error);
      } else {
        setContact(data);
      }
    };
    fetchContact();
  }, []);

  const handleDeleteContact = async (id) => {
    if (!user) {
      alert("Vous devez être connecté pour supprimer un contact.");
      return;
    }

    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce contact ?")) {
      try {
        await supabase.from("contact").delete().eq("id", id);
        setContact(contact.filter((c) => c.id !== id));
      } catch (error) {
        console.error("Erreur lors de la suppression du contact", error);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert("Erreur de connexion : " + error.message);
    } else {
      setUser(data.user);
      setIsLoginFormVisible(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="contact-page">
      <h1 className="title">Table des contacts</h1>
      {user ? (
        <div>
          <h2 className="section-title">Contact</h2>
          <table className="contact-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Supprimer</th>
              </tr>
            </thead>
            <tbody>
              {contact.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>
                    <button className="delete-button" onClick={() => handleDeleteContact(c.id)}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <p>Vous devez être connecté pour voir les contacts.</p>
          <button className="login-button" onClick={() => setIsLoginFormVisible(true)}>Se connecter</button>
        </div>
      )}

      {isLoginFormVisible && (
        <form className="login-form" onSubmit={handleLogin}>
          <input
            className="input-field"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            className="input-field"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            required
          />
          <button type="submit" className="submit-button">Se connecter</button>
        </form>
      )}

      <button className="logout-button" onClick={handleLogout}>Se déconnecter</button>
    </div>
  );
}

export default ContactPage;
