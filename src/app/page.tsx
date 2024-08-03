"use client";

import { Box, Stack, Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemText } from "@mui/material";
import { firestore } from "@/utils/firebase";
import { collection, query, getDocs, getDoc, doc, deleteDoc, setDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { PantryItem } from "@/types/PantryItems";
import DeleteIcon from '@mui/icons-material/Delete';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

export default function Home() {
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [filteredItems, setFilteredItems] = useState<string[]>([]);

  const [recipeName, setRecipeName] = useState("Looking for what to make? I'm here to help");
  const [description, setDescription] = useState("");
  const [recipeOpen, setRecipeOpen] = useState(false);

  const db = collection(firestore, 'Pantry');

  const updatePantry = async () => {
    try {
      const q = query(db);
      const querySnapshot = await getDocs(q);
      const pantrylist: PantryItem[] = querySnapshot.docs.map(doc => ({
        ...(doc.data() as PantryItem),
        name: doc.id
      }));
      setPantry(pantrylist);
    } catch (error) {
      console.error("Error fetching pantry data:", error);
    }
  };

  const removePantryItem = async (item: string) => {
    try {
      const docRef = doc(db, item);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { count } = docSnap.data();
        if (count === 1) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { count: count - 1 });
        }
      }
      await updatePantry();
    } catch (error) {
      console.error("Error deleting pantry item:", error);
    }
  };

  const transformText = (text: string) => 
    text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  
  const addPantryItem = async (item: string) => {
    const transformedItem = transformText(item);
  
    try {
      const docRef = doc(db, transformedItem);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const { count } = docSnap.data();
        await updateDoc(docRef, { count: count + 1 });
      } else {
        await setDoc(docRef, { count: 1 });
      }
      await updatePantry();
    } catch (error) {
      console.error("Error updating pantry item:", error);
    }
  };
  
  const handleAddPantryItem = () => {
    if (itemName.trim()) {
      addPantryItem(itemName);
      setItemName("");
      setFilteredItems([]);
      handleCloseModal();
    }
  };

  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => {
    setOpen(false);
    setItemName("");
    setFilteredItems([]);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Capitalize the first letter and make the rest lowercase
    const transformedValue = transformText(value);
    
    setItemName(transformedValue);
  
    if (transformedValue.length > 0) {
      const filtered = pantry
        .map(item => item.name)
        .filter(name => name.toLowerCase().includes(transformedValue.toLowerCase()));
      setFilteredItems(filtered);
    } else {
      setFilteredItems([]);
    }
  };
  

  const handleSelectItem = (item: string) => {
    setItemName(item);
    setFilteredItems([]);
  };

  // Generate recipe based on ingredients
  const generateRecipe = async () => {
    try {
      const ingredients = pantry.map(item => `${item.name} (${item.count})`).join(', ');
      const prompt = `Create a unique recipe using the following ingredients: ${ingredients}. Provide an image URL for the recipe.`;
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers:{
          'content-type': 'application/json'
        },
        body: JSON.stringify({ body: prompt })
      });

      const data = await response.json();
      console.log("data", data);

      if (response.ok) {
        setRecipeName(data.name);
        setDescription(data.description);
        setRecipeOpen(true);
      } else {
        setRecipeName(data.error);
        setDescription("")
      }
      
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    updatePantry();
  }, []);

  return (
    <Box
      width="100vw"
      height="100vh"
      alignItems="center"
      display="flex"
      justifyContent="center"
      flexDirection="column"
      sx={{
        backgroundImage: 'url(/Padhu-pantry.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: 2,
      }}
    >
      <Typography
        variant="h1"
        align="center"
        sx={{
          fontFamily: 'Georgia, serif',
          color: '#6D4C41',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
          padding: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '8px',
          marginBottom: 4,
        }}
      >
        Pantry Box
      </Typography>
      <Box border="1px solid #6D4C41" width="800px" height="50vh" overflow="hidden" display={"flex"} flexDirection={"column"} borderRadius={2}>
        <Stack spacing={2} padding={2} sx={{ overflowY: 'auto' }}>
          {pantry.map((item) => (
            <Box key={item.name} width="100%" height="60px" display="flex" justifyContent="space-between" alignItems="center" bgcolor="#F5F5F5" padding={2} borderRadius={2}>
              <Typography variant="h5">{item.name} - {item.count}</Typography>
              <Stack direction={'row'} spacing={2}>
                <Button variant="contained" color="success" onClick={() => addPantryItem(item.name)} startIcon={<AddShoppingCartIcon />}>
                  Add
                </Button>
                <Button variant="contained" color="error" onClick={() => removePantryItem(item.name)} startIcon={<DeleteIcon />}>
                  Delete
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
        <Box width="100%" padding={2} display={"flex"} justifyContent={"center"}>
          <Button variant="contained" color="primary" onClick={handleOpenModal} sx={{ mt: 2 }} startIcon={<AddShoppingCartIcon />}>
            Add Item
          </Button>
        </Box>
      </Box>

      {/* Modal for adding items */}
      <Dialog open={open} onClose={handleCloseModal}>
        <DialogTitle>Add Pantry Item</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Item Name"
            fullWidth
            value={itemName}
            onChange={handleSearchChange}
          />
          <List>
            {filteredItems.map((item) => (
              <ListItem button key={item} onClick={() => handleSelectItem(item)}>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddPantryItem} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Recipe Modal */}
      <Dialog open={recipeOpen} onClose={() => setRecipeOpen(false)}>
        <DialogTitle>{recipeName}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {description}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecipeOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Recipe Generation Section */}
      <Box
        mt={4}
        display="flex"
        flexDirection="column"
        alignItems="center"
        bgcolor="white"
        color="black"
        padding={2}
        borderRadius={2}
        boxShadow={3}
      >
        <Typography variant="h5" align="center" mt={2}>
          <Button onClick={generateRecipe} variant="contained" color="secondary">Generate Recipe</Button>
        </Typography>
        <Box mt={2} textAlign="center">
          <Typography variant="h6">{recipeName}</Typography>
        </Box>
      </Box>
    </Box>
  );
}
