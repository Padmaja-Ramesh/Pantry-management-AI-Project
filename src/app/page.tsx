"use client";

import { Box, Stack, Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemText } from "@mui/material";
import { firestore } from "@/firebase";
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
  const db = collection(firestore, 'Pantry');

  // helper functions => updatePantry, addPantryItem, removePantryItem

  const updatePantry = async () => {
    try {
      const q = query(db); //make sure to check the collection name its case sensitive
      const querySnapshot = await getDocs(q);
      const pantrylist: PantryItem[] = querySnapshot.docs.map(doc => ({
        ...(doc.data() as PantryItem),
        name: doc.id
      }));
      setPantry(pantrylist);
      console.log(pantrylist)
    } catch (error) {
      console.error("Error fetching pantry data:", error);
    }
  };

  const removePantryItem = async(item: string) =>{
    try {
      const docRef = doc(db, item);
      const docSnap = await getDoc(docRef);

      if(docSnap.exists()){
        const {count} = docSnap.data();
        if (count === 1){
          await deleteDoc(docRef);
        } else{
          await setDoc(docRef, {count: count - 1});
        }
      }
    await updatePantry();
      
    } catch (error) {
      console.error("Error deleting pantry item:", error);
      
    }
  }

  const addPantryItem = async(item : string) =>{
    try {
      const docRef = doc(db, item);
      console.log(docRef)
      const docSnap = await getDoc(docRef);
      console.log(docSnap)

      if(docSnap.exists()){
        console.log("exists")
        const {count} = docSnap.data();
        await updateDoc(docRef, {count : count + 1});
        }else {
          await setDoc(docRef, {count: 1})
        }
    await updatePantry()
      
    } catch (error) {
      console.error("Error updating pantry item:", error);
    }
  }

  // handler => AddPantryItem, OpenModel, CloseModel, searchChange
  const handleAddPantryItem = () => {
    if (itemName.trim()) {
      addPantryItem(itemName);
      setItemName("");
      setFilteredItems([]);
      handleCloseModal()
    }
  };

  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => {setOpen(false); setItemName(""); setFilteredItems([])};

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setItemName(value);
    if (value.length > 0) {
      const filtered = pantry
        .map(item => item.name)
        .filter(name => name.toLowerCase().includes(value.toLowerCase()));
      setFilteredItems(filtered);
    } else {
      setFilteredItems([]);
    }
  };

  const handleSelectItem=(Item:string) =>{
    setItemName(Item);
    setFilteredItems([]);
  }

  useEffect(() => {
    updatePantry();
  }, []);

  return (
    <Box width="100vw" height="100vh" alignItems="center" display="flex" justifyContent="center" flexDirection="column">
    <Typography variant="h1">Pantry Box</Typography>
    <Box border="1px solid #333" width="800px">
      <Stack spacing={2} padding={2}>
        {pantry.map((item) => (
          <Box key={item.name} width="100%" height="100px" display="flex" justifyContent="space-between" alignItems="center" bgcolor="#f0f0f0" padding={2}>
            <Typography variant="h3">{item.name} - {item.count}</Typography>
            <Stack direction={'row'} spacing={2}>
            <Button variant="contained" color="error" onClick={() => addPantryItem(item.name)} startIcon={<AddShoppingCartIcon />}>
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
        <Button variant="contained" color="primary" onClick={handleOpenModal} sx={{ mt: 2 }}  startIcon={<AddShoppingCartIcon />}>
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
        <Button onClick={handleAddPantryItem} color="primary" >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  </Box>
  );
}
