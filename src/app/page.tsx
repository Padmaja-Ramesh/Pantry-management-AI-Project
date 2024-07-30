import { Box, Stack, Typography } from "@mui/material";

const item= ['tomato', 'potato', 'rice','beans', 'lettuce', 'greens', 'spinach', 'ice-cream', 'pasta']
export default function Home() {
  return (
    <Box width="100vw" height="100vh" alignItems="center" display={'flex'} justifyContent={'center'} flexDirection={'column'}>
      <Box border={'1px solid #333'}>
      <Box width={'800px'} height={'100px'} bgcolor={'orange'}>
        <Typography variant="h2" color={'#333'} textAlign={'center'}> Pantry Items</Typography>
      </Box>
      <Stack width="800px" height="400px" spacing={2} overflow={'scroll'} >
        {item.map((i) =>(
                  <Box key={i} width="100%" height="100px" display={'flex'} justifyContent={'center'} alignItems={'center'} bgcolor={'#f0f0f0'}>
                    <Typography variant="h3" textAlign={'center'}>
                    {i}
                    </Typography>
                  </Box>        
        ))}

      </Stack>
      </Box>
    </Box>
  );
}
