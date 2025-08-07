"use client";

import { useState } from "react";
import { ICONS } from "@/constants/path";
import Image from "next/image";

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
      <h1 className="text-4xl font-bold py-[10px] h-16 space-y-1">환경설정</h1>

      <div className="relative flex gap-4 border-b border-gray-300 mt-4 space-y-1">
        <div className="w-1/6 px-4 py-2 text-lg text-center">알림설정</div>
        <span className="absolute left-0 bottom-0 w-1/6 h-[2px] bg-black"></span>
      </div>

      <div className="relative flex items-center gap-6 text-lg mt-4">
        <div className="text-center">활동 알림</div>
        <div className="text-sm">전체알림</div>

        <button
          onClick={HandleActivityToggle}
          className="absolute left-[400px]"
        >
          <div className="relative w-[30px] h-[30px]">
            <Image
              src={
                activityToggle ? "/img/TOGGLE_ON.svg" : "/img/TOGGLE_OFF.svg"
              }
              alt="토글"
              fill
              className="object-fill"
            />
          </div>
        </button>
      </div>

      <div className="w-full border border-gray-300 rounded-sm p-4 mt-1 space-y-3">
        {/* 아래 동기화된 토글들 */}
        <div className="flex justify-between items-center">
          <div className="text-sm">새로운 이벤트 알림</div>
          <button
            onClick={() => setNewEventToggle(!newEventToggle)}
            className="absolute left-[400px]"
          >
            <div className="relative w-[30px] h-[30px]">
              <Image
                src={
                  newEventToggle ? "/img/TOGGLE_ON.svg" : "/img/TOGGLE_OFF.svg"
                }
                alt="토글"
                fill
                className="object-fill"
              />
            </div>
          </button>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm">댓글 알림</div>
          <button
            onClick={() => setNewReplyToggle(!newReplyToggle)}
            className="absolute left-[400px]"
          >
            <div className="relative w-[30px] h-[30px]">
              <Image
                src={
                  newReplyToggle ? "/img/TOGGLE_ON.svg" : "/img/TOGGLE_OFF.svg"
                }
                alt="토글"
                fill
                className="object-fill"
              />
            </div>
          </button>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm">팔로우 알림</div>
          <button
            onClick={() => setNewFollowToggle(!newFollowToggle)}
            className="absolute left-[400px]"
          >
            <div className="relative w-[30px] h-[30px]">
              <Image
                src={
                  newFollowToggle ? "/img/TOGGLE_ON.svg" : "/img/TOGGLE_OFF.svg"
                }
                alt="토글"
                fill
                className="object-fill"
              />
            </div>
          </button>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm">메세지 알림</div>
          <button
            onClick={() => setNewMessageToggle(!newMessageToggle)}
            className="absolute left-[400px]"
          >
            <div className="relative w-[30px] h-[30px]">
              <Image
                src={
                  newMessageToggle
                    ? "/img/TOGGLE_ON.svg"
                    : "/img/TOGGLE_OFF.svg"
                }
                alt="토글"
                fill
                className="object-fill"
              />
            </div>
          </button>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm">동행 신청 알림</div>
          <button
            onClick={() => setNewWithToggle(!newWithToggle)}
            className="absolute left-[400px]"
          >
            <div className="relative w-[30px] h-[30px]">
              <Image
                src={
                  newWithToggle ? "/img/TOGGLE_ON.svg" : "/img/TOGGLE_OFF.svg"
                }
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
      <div className="flex justify-between items-center border border-gray-300 rounded-sm p-4 mt-1 ">
        <div className="text-sm">푸시 알림</div>
        <button
          onClick={() => setPushToggle(!pushToggle)}
          className="absolute left-[400px]"
        >
          <div className="relative w-[30px] h-[30px]">
            <Image
              src={pushToggle ? "/img/TOGGLE_ON.svg" : "/img/TOGGLE_OFF.svg"}
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
        <div className="flex justify-between items-center">
          <div className="text-sm">이메일 수신 동의</div>
          <button
            onClick={() => setEmailToggle(!emailToggle)}
            className="absolute left-[400px]"
          >
            <div className="relative w-[30px] h-[30px]">
              <Image
                src={emailToggle ? "/img/TOGGLE_ON.svg" : "/img/TOGGLE_OFF.svg"}
                alt="토글"
                fill
                className="object-fill"
              />
            </div>
          </button>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm">sms 수신 동의</div>
          <button
            onClick={() => setSmsToggle(!smsToggle)}
            className="absolute left-[400px]"
          >
            <div className="relative w-[30px] h-[30px]">
              <Image
                src={smsToggle ? "/img/TOGGLE_ON.svg" : "/img/TOGGLE_OFF.svg"}
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
