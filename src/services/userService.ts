import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  query, 
  where, 
  getDocs 
} from "firebase/firestore";
import { db } from "../firebase/config";

export interface Usuario {
  id: string;
  nome: string;
  cpf: string;
  nascimento: string;
  email: string;
  telefone: string;
  cargo: string;
  departamento: string;
  status: string;
  tipo: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const getUserById = async (userId: string): Promise<Usuario | null> => {
  try {
    const userDoc = await getDoc(doc(db, "usuarios", userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as Usuario;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return null;
  }
};

export const getUserByEmail = async (email: string): Promise<Usuario | null> => {
  try {
    const q = query(collection(db, "usuarios"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() } as Usuario;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar usuário por email:", error);
    return null;
  }
};

export const createUser = async (userData: Omit<Usuario, "id">): Promise<string | null> => {
  try {
    const docRef = doc(collection(db, "usuarios"));
    await setDoc(docRef, {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return null;
  }
};

export const updateUser = async (userId: string, userData: Partial<Usuario>): Promise<boolean> => {
  try {
    await updateDoc(doc(db, "usuarios", userId), {
      ...userData,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return false;
  }
};