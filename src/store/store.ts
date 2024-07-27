import { configureStore, combineReducers} from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import popupSlice from './slice/popupSlice';
import { persistReducer, persistStore } from "redux-persist";
import channelSlice from "./slice/channelSlice.ts";
import postSlice from "./slice/postSlice.ts";
import dmSlice from "./slice/dmSlice.ts";
import chatSlice from "./slice/chatSlice.ts";
import typingSlice from "./slice/typingSlice.ts";
import globalSearchSlice from "./slice/globalSearchSlice.ts";
import sidebarSlice from "./slice/sidebarSlice.ts";
import refreshSlice from "./slice/refreshSlice.ts";
import mentionSlice from "./slice/mentionSlice.ts";
import lastSelectedPersistSlice from "@/store/slice/lastSelectedPersist.ts";


const rootPersistConfig = {
    key: 'root',
    storage: storage,
    whitelist: [
        lastSelectedPersistSlice.name
        // channelSlice.name,
        // postSlice.name,
        // dmSlice.name,
        // chatSlice.name
    ]
}

const rootReducer = combineReducers({
    [lastSelectedPersistSlice.name]: lastSelectedPersistSlice.reducer,
    [popupSlice.name]: popupSlice.reducer,
    [channelSlice.name]: channelSlice.reducer,
    [postSlice.name]: postSlice.reducer,
    [dmSlice.name]: dmSlice.reducer,
    [chatSlice.name]: chatSlice.reducer,
    [typingSlice.name]: typingSlice.reducer,
    [globalSearchSlice.name]: globalSearchSlice.reducer,
    [sidebarSlice.name]: sidebarSlice.reducer,
    [refreshSlice.name]: refreshSlice.reducer,
    [mentionSlice.name]: mentionSlice.reducer
})

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
})

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof rootReducer>

export default store;
