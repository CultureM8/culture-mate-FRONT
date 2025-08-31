"use client";

import { useState } from "react";
import { ICONS } from "@/constants/path";
import Image from "next/image";
import PageTitle from "@/components/global/PageTitle";

export default function Preference() {
  const [activityToggle, setActivityToggle] = useState(false);
  const [newEventToggle, setNewEventToggle] = useState(false);
  const [newReplyToggle, setNewReplyToggle] = useState(false);
  const [newFollowToggle, setNewFollowToggle] = useState(false);
  const [newMessageToggle, setNewMessageToggle] = useState(false);
  const [newWithToggle, setNewWithToggle] = useState(false);
  const [pushToggle, setPushToggle] = useState(false);
  const [emailToggle, setEmailToggle] = useState(false);
  const [smsToggle, setSmsToggle] = useState(false);

  /* 활동알림의 전체알림 클릭 시 */
  const HandleActivityToggle = () => {
    const newValue = !activityToggle;
    setActivityToggle(newValue);
    setNewEventToggle(newValue);
    setNewReplyToggle(newValue);
    setNewFollowToggle(newValue);
    setNewMessageToggle(newValue);
    setNewWithToggle(newValue);
    setPushToggle(newValue);
    setEmailToggle(newValue);
    setSmsToggle(newValue);
  };

  return (
    <>
      <PageTitle>환경설정</PageTitle>

      <div className="relative flex gap-4 mt-4">
        <div className="w-1/4 px-4 py-2 text-center">알림설정</div>
        <span className="absolute left-0 bottom-[-1.5px] w-1/4 h-[2px] bg-black"></span>
        <div className="absolute left-0 bottom-[-2.5px] w-full h-[1px] bg-gray-300"></div>
      </div>

      <div className="flex items-center text-lg mt-4 pb-[10px]">
        <div className="flex items-center gap-6 w-52">
          <div className="text-center">활동 알림</div>
          <div className="text-sm">전체알림</div>
        </div>

        <button
          onClick={HandleActivityToggle}
        >
          <div className="relative w-[30px] h-[30px]">
            <Image
              src={activityToggle ? ICONS.TOGGLE_ON : ICONS.TOGGLE_OFF}
              alt="토글"
              fill
              className="object-fill"
            />
          </div>
        </button>
      </div>

      <div className="w-full border border-gray-300 rounded-sm p-4 mt-1 space-y-3">
        <div className="flex items-center">
          <div className="text-sm w-52">새로운 이벤트 알림</div>
          <button
            onClick={() => setNewEventToggle(!newEventToggle)}
          >
            <div className="relative w-[30px] h-[30px]">
              <Image
                src={newEventToggle ? ICONS.TOGGLE_ON : ICONS.TOGGLE_OFF}
                alt="토글"
                fill
                className="object-fill"
              />
            </div>
          </button>
        </div>
        <div className="flex items-center">
          <div className="text-sm w-52">댓글 알림</div>
          <button
            onClick={() => setNewReplyToggle(!newReplyToggle)}
          >
            <div className="relative w-[30px] h-[30px]">
              <Image
                src={newReplyToggle ? ICONS.TOGGLE_ON : ICONS.TOGGLE_OFF}
                alt="토글"
                fill
                className="object-fill"
              />
            </div>
          </button>
        </div>
        <div className="flex items-center">
          <div className="text-sm w-52">팔로우 알림</div>
          <button
            onClick={() => setNewFollowToggle(!newFollowToggle)}
          >
            <div className="relative w-[30px] h-[30px]">
              <Image
                src={newFollowToggle ? ICONS.TOGGLE_ON : ICONS.TOGGLE_OFF}
                alt="토글"
                fill
                className="object-fill"
              />
            </div>
          </button>
        </div>
        <div className="flex items-center">
          <div className="text-sm w-52">메세지 알림</div>
          <button
            onClick={() => setNewMessageToggle(!newMessageToggle)}
          >
            <div className="relative w-[30px] h-[30px]">
              <Image
                src={newMessageToggle ? ICONS.TOGGLE_ON : ICONS.TOGGLE_OFF}
                alt="토글"
                fill
                className="object-fill"
              />
            </div>
          </button>
        </div>
        <div className="flex items-center">
          <div className="text-sm w-52">동행 신청 알림</div>
          <button
            onClick={() => setNewWithToggle(!newWithToggle)}
          >
            <div className="relative w-[30px] h-[30px]">
              <Image
                src={newWithToggle ? ICONS.TOGGLE_ON : ICONS.TOGGLE_OFF}
                alt="토글"
                fill
                className="object-fill"
              />
            </div>
          </button>
        </div>
      </div>

      <div className="relative flex items-center gap-6 text-lg mt-4">
        <div>기타</div>
      </div>
      <div className="flex items-center border border-gray-300 rounded-sm p-4 mt-1 ">
        <div className="text-sm w-52">푸시 알림</div>
        <button
          onClick={() => setPushToggle(!pushToggle)}
        >
          <div className="relative w-[30px] h-[30px]">
            <Image
              src={pushToggle ? ICONS.TOGGLE_ON : ICONS.TOGGLE_OFF}
              alt="토글"
              fill
              className="object-fill"
            />
          </div>
        </button>
      </div>

      <div className="relative flex items-center gap-6 text-lg mt-4">
        <div>마케팅 정보 수신</div>
      </div>
      <div className="w-full border border-gray-300 rounded-sm p-4 mt-1 space-y-3">
        {/* 아래 동기화된 토글들 */}
        <div className="flex items-center">
          <div className="text-sm w-52">이메일 수신 동의</div>
          <button
            onClick={() => setEmailToggle(!emailToggle)}
          >
            <div className="relative w-[30px] h-[30px]">
              <Image
                src={emailToggle ? ICONS.TOGGLE_ON : ICONS.TOGGLE_OFF}
                alt="토글"
                fill
                className="object-fill"
              />
            </div>
          </button>
        </div>
        <div className="flex items-center">
          <div className="text-sm w-52">sms 수신 동의</div>
          <button
            onClick={() => setSmsToggle(!smsToggle)}
          >
            <div className="relative w-[30px] h-[30px]">
              <Image
                src={smsToggle ? ICONS.TOGGLE_ON : ICONS.TOGGLE_OFF}
                alt="토글"
                fill
                className="object-fill"
              />
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
