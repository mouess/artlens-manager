import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lvdvmqdtzqzuzppnjhvj.supabase.co"; 
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2ZHZtcWR0enF6dXpwcG5qaHZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxNjkwMzksImV4cCI6MjA1NTc0NTAzOX0.H0v-0n9lqDRCdxPtWRUcKVsPZTkk36iOOayuFgGAzXA";
const supabase = createClient(supabaseUrl, supabaseKey);

function ItemPage() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginFormVisible, setIsLoginFormVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from("items").select("*");
      if (error) {
        console.error("Erreur lors de la récupération des éléments", error);
      } else {
        setItems(data);
      }

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Vous devez être connecté pour ajouter un élément.");
      return;
    }

    if (!image) {
      alert("Veuillez sélectionner une image.");
      return;
    }

    const fileName = `public/${Date.now()}_${image.name}`;
    const { data, error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, image);

    if (uploadError) {
      console.error("Erreur lors de l'upload de l'image:", uploadError);
      return;
    }

    const imageUrl = data.path;
    const { data: newItem, error: dbError } = await supabase.from("items").insert([
      { name, description, category, type, imageUrl, user_id: user.id },
    ]).select();

    if (dbError) {
      console.error("Erreur lors de l'ajout de l'élément:", dbError);
      return;
    }

    alert("Élément ajouté avec succès!");
    setItems((prevItems) => [...prevItems, ...newItem]);

    setName("");
    setDescription("");
    setCategory("");
    setType("");
    setImage(null);
  };

  const handleDelete = async (id) => {
    if (!user) {
      alert("Vous devez être connecté pour supprimer un élément.");
      return;
    }

    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
      try {
        await supabase.from("items").delete().eq("id", id);
        setItems(items.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Erreur lors de la suppression de l'élément", error);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { user, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert("Erreur de connexion : " + error.message);
    } else {
      setUser(user);
      setIsLoginFormVisible(false); // Ferme le formulaire après la connexion
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const getImageUrl = (path) => {
    const { publicURL } = supabase.storage.from("images").getPublicUrl(path);
    return publicURL;
  };

  return (
    <div>
      <h1>Ajouter un nouvel élément</h1>
      {user ? (
        <form onSubmit={handleSubmit}>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom" required />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required />
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Catégorie" required />
          <input type="text" value={type} onChange={(e) => setType(e.target.value)} placeholder="Type" required />
          <input type="file" onChange={(e) => setImage(e.target.files[0])} required />
          <button type="submit">Ajouter</button>
        </form>
      ) : (
        <div>
          <p>Vous devez être connecté pour ajouter un élément.</p>
          <button onClick={() => setIsLoginFormVisible(true)}>Se connecter</button>
        </div>
      )}

      <button onClick={handleLogout}>Se déconnecter</button>

      {isLoginFormVisible && (
        <div>
          <h2>Formulaire de connexion</h2>
          <form onSubmit={handleLogin}>
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <input 
              type="password" 
              placeholder="Mot de passe" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <button type="submit">Se connecter</button>
          </form>
        </div>
      )}

      <h1>Liste des éléments</h1>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <h2>{item.name}</h2>
            <p>{item.description}</p>
            <p><strong>Catégorie:</strong> {item.category}</p>
            <p><strong>Type:</strong> {item.type}</p>
            {item.imageUrl && <img src={getImageUrl(item.imageUrl)} alt={item.name} />}
            {user && <button onClick={() => handleDelete(item.id)}>Supprimer</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ItemPage;