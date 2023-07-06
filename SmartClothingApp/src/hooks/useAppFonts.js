import * as Font from "expo-font";
import { AppFontsResource } from "../../assets";

export const useAppFonts = async () => await Font.loadAsync(AppFontsResource);
