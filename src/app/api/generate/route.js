import { NextResponse } from "next/server";
import { getModel } from "../../../utils/openai";
import axios from 'axios';
import sharp from 'sharp';

export async function POST(req, res) {
    try {
        const data = await req.json();
        const prompt = data.body;

        const model = await getModel();
        const result = await model.generateContent(`Create a unique recipe using the following ingredients: ${prompt}. Provide an image URL for the recipe.`);
        const response = await result.response;
        const output = await response.text();

        // Log raw output for debugging
        console.log("Raw API response:", output);

        // Extract recipe name, description, and image URL using regex
        const recipeNameRegex = /\*\*([^*]+)\*\*/i; // Match text between bold markers
        const descriptionRegex = /(?:\*\*Enjoy your unique and delicious.*?\*\*|(?:[\s\S]+?))$/i; // Match description
        const imageUrlRegex = /(?:\*\*Image URL:\*\*\s*(https?:\/\/.*?\.(?:jpg|jpeg|png|gif)))/i; // Match image URL
        const imageUrlMatch = output.match(imageUrlRegex);


        const recipeNameMatch = output.match(recipeNameRegex);
        const descriptionMatch = output.match(descriptionRegex);
        const imageUrl = imageUrlMatch ? imageUrlMatch[1] : '';

        if (!recipeNameMatch) {
            console.error("Failed to extract recipe name from the response");
            return NextResponse.json({ error: "Failed to extract recipe name from the response" }, { status: 400 });
        }
        if (!descriptionMatch) {
            console.error("Failed to extract description from the response");
            return NextResponse.json({ error: "Failed to extract description from the response" }, { status: 400 });
        }

        const recipeName = recipeNameMatch[1]?.trim() || 'Unknown Recipe Name';
        const description = descriptionMatch[0]?.trim() || 'No description available';

        // Fetch and convert the image if needed
        let base64Image = '';
        if (imageUrl) {
            try {
                const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

                if (imageResponse.status === 200) {
                    const buffer = Buffer.from(imageResponse.data, 'binary');
                    const jpegBuffer = await sharp(buffer).jpeg().toBuffer();
                    base64Image = `data:image/jpeg;base64,${jpegBuffer.toString('base64')}`;
                } else {
                    console.error(`Failed to fetch image: ${imageUrl}, Status code: ${imageResponse.status}`);
                }
            } catch (error) {
                console.error(`Error fetching image: ${imageUrl}, ${error.message}`);
            }
        }


        const responseObject = {
            name: recipeName,
            description: description,
            image: base64Image,  
        };

        return NextResponse.json(responseObject);
    } catch (error) {
        console.error("Error occurred:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
