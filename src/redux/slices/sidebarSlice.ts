import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '@/redux/store'

interface SidebarState {
    expanded: boolean
}

const initialState: SidebarState = {
    expanded: true // Mặc định là Sidebar mở
}

export const sidebarSlice = createSlice({
    name: 'sidebar',
    initialState,
    reducers: {
        toggleSidebar(state) {
            state.expanded = !state.expanded
        }
    }
})

export const sidebarSliceSelector = (state: RootState) => state.sidebar
