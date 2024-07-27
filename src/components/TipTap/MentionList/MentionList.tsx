import {MentionOptions} from "@tiptap/extension-mention";
import {ReactRenderer} from "@tiptap/react";
import {SuggestionKeyDownProps, SuggestionProps} from "@tiptap/suggestion";
import {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import tippy, {Instance as TippyInstance} from "tippy.js";
import './MentionList.scss'
import ProfileService, {UserDgraphInfoInterface, UsersListRes} from "../../../services/ProfileService.ts";
import MentionMember from "./MentionMember.tsx";
import store from "../../../store/store.ts";
import {updateMentionOpenedRecently} from "../../../store/slice/mentionSlice.ts";

export type MentionSuggestion = {
  id: string;
  mentionLabel: string;
  label: string
};

const DOM_RECT_FALLBACK: DOMRect = {
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
    toJSON() {
      return {};
    },
  };


export const mentionSuggestionOptions: MentionOptions["suggestion"] = {

  items: async ({ query }): Promise<UserDgraphInfoInterface[]> => {
      const usersListRes = await ProfileService.getAllUsersList() // makes swr call

      if(usersListRes.status !== 200) {
          return []
      }
      const usersList: UsersListRes  = usersListRes.data
      return usersList.users.filter((user) =>
          user.user_full_name.toLowerCase().startsWith(query.toLowerCase())
      ).slice(0, 5);
  },

      render: () => {
    let component: ReactRenderer<MentionRef> | undefined;
    let popup: TippyInstance | undefined;

    return {
      onStart: (props) => {

        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,

        });

        popup = tippy("body", {
            getReferenceClientRect: () =>
              props.clientRect?.() ?? DOM_RECT_FALLBACK,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: "manual",
            placement: "bottom-start",
          })[0];
      },

      onUpdate(props) {
        component?.updateProps(props);

        popup?.setProps({
            getReferenceClientRect: () => props.clientRect?.() || DOM_RECT_FALLBACK,
        });
      },

      onKeyDown(props) {
        if (props.event.key === "Escape") {
          popup?.hide();
          return true;
        }

        if (!component?.ref) {
          return false;
        }

        return component?.ref.onKeyDown(props);
      },

      onExit() {
        popup?.destroy();
        component?.destroy();

        // Remove references to the old popup and component upon destruction/exit.
        // (This should prevent redundant calls to `popup.destroy()`, which Tippy
        // warns in the console is a sign of a memory leak, as the `suggestion`
        // plugin seems to call `onExit` both when a suggestion menu is closed after
        // a user chooses an option, *and* when the editor itself is destroyed.)
        popup = undefined;
        component = undefined;
      },
    };
  },
};

type MentionRef = {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
};

interface MentionProps extends SuggestionProps {
  items: UserDgraphInfoInterface[];
}

const MentionList = forwardRef<MentionRef, MentionProps>((props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
        if (index >= props.items.length) {
            return;
        }

        const suggestion = props.items[index];
        const mentionItem: MentionSuggestion = {
            id: `${suggestion.user_uuid}@${suggestion.uid}`,
            mentionLabel: suggestion.user_full_name,
            label: suggestion.user_name
        };
        props.command(mentionItem);
    };

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
    };

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
        selectItem(selectedIndex);
        store.dispatch(updateMentionOpenedRecently({openedRecently: true}))
    };

    useEffect(() => {
        setSelectedIndex(0);
    }, [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: SuggestionKeyDownProps) => {
            if (event.key === "ArrowUp") {
                upHandler();
                return true;
            }

            if (event.key === "ArrowDown") {
                downHandler();
                return true;
            }

            if (event.key === "Enter") {
                enterHandler();
                return true;
            }

            return false;
        },
    }));


    return props.items.length > 0 ? (
        <div className="items mentions-list">
            {props.items.map((item, index) => (

                <MentionMember
                    key={index}
                    ind={index}
                    person={item}
                    selectItem={selectItem}
                    selectedIndex={selectedIndex}
                />

            ))}
        </div>
    ) : null;
});

MentionList.displayName = "MentionList";
export default MentionList;
