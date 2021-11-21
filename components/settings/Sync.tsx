/**!
 * @author Yuto Watanabe
 *
 * Copyright (C) 2021 logcation
 */

import {
  ListIcon,
  Box,
  FormControl,
  Switch,
  FormLabel,
  Modal,
  ModalBody,
  ModalOverlay,
  ModalHeader,
  ModalCloseButton,
  ModalFooter,
  Button,
  ModalContent,
  useDisclosure,
  Input,
  Text,
  Checkbox,
  Textarea,
  Flex,
  useClipboard,
} from '@chakra-ui/react';
import {colors} from '../../utils/colors';
import {IoSyncOutline} from 'react-icons/io5';
import React from 'react';
import {isCloud, userInfo} from '../../utils/recoilAtoms';
import {useRecoilState} from 'recoil';
import useCreateUser from '../../hooks/useCreateUser';
import useLoginUser from '../../hooks/useLoginUser';
import useDeleteUser from '../../hooks/useDeleteUser';
import Link from 'next/link';

const Sync = () => {
  const [cloud, setCloud] = useRecoilState(isCloud);
  const {isOpen, onOpen, onClose} = useDisclosure();
  const {
    isOpen: isOpenLogout,
    onOpen: onOpenLogout,
    onClose: onCloseLogout,
  } = useDisclosure();
  const {
    isOpen: isOpenShowId,
    onOpen: onOpenShowId,
    onClose: onCloseShowId,
  } = useDisclosure();
  const [userName, setUserName] = React.useState('');
  const [userNameState, setUserNameState] = React.useState(false);
  const [startOk, setStartOk] = React.useState(false);
  const [isLogin, setIsLogin] = React.useState(false);
  const [createUser] = useCreateUser();
  const [loginUser] = useLoginUser();
  const [logoutUser] = useDeleteUser();
  const [user, setUserInfo] = useRecoilState(userInfo);
  const {onCopy} = useClipboard(user?.id);

  const handleChange = () => {
    if (!cloud) {
      onOpen();
    } else {
      onOpenLogout();
    }
  };

  const logout = (isDelete: boolean) => {
    if (isDelete) {
      logoutUser();
    } else {
      setUserInfo(null);
      setCloud(false);
    }

    onCloseLogout();
  };

  const start = () => {
    if (userName.length === 0) {
      setUserNameState(true);
      return;
    }
    setUserNameState(false);
    setUserName('');
    onClose();

    if (isLogin) {
      loginUser(userName);
    } else {
      createUser(userName, () => {
        // ユーザにID保存を促すモーダルを表示
        onOpenShowId();
      });
    }
  };

  const inputUserName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        motionPreset="slideInBottom"
        size="sm"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>クラウド同期を開始する</ModalHeader>
          <ModalCloseButton size="lg" />
          <ModalBody>
            {isLogin ? (
              <Text>
                ログを同期するにはIDを入力してください。
                <br />
                すでにログインしているユーザが対象です。
              </Text>
            ) : (
              <Text>
                ユーザ名を設定します。
                <br />
                ランキングに表示されるため、特定されない、公的秩序に反しない名前をご使用ください。
                <br />
                再ログイン、他端末でログインではユーザ名は使用しません。
              </Text>
            )}
            <Input
              marginTop="1rem"
              placeholder={isLogin ? 'ID' : 'ユーザ名'}
              value={userName}
              onChange={inputUserName}
              isInvalid={userNameState}
            />
            <Switch
              marginY="1rem"
              onChange={() => {
                setIsLogin(v => !v);
                setUserName('');
              }}
              isChecked={isLogin}
            >
              IDを入力してログインする
            </Switch>
            <Checkbox
              isChecked={startOk}
              onChange={() => setStartOk(!startOk)}
              marginTop=".5rem"
              size="lg"
            >
              <Link href="/terms">
                <Text fontWeight="bold" as="span" textDecoration="underline">
                  利用規約
                </Text>
              </Link>
              と
              <Link href="/privacy">
                <Text fontWeight="bold" as="span" textDecoration="underline">
                  プライバシーポリシー
                </Text>
              </Link>
              に同意する
            </Checkbox>
          </ModalBody>
          <ModalFooter>
            <Button
              backgroundColor={colors('mainPrimary')}
              onClick={start}
              disabled={!startOk}
            >
              利用開始
            </Button>
            <Button
              color={colors('textPrimary')}
              variant="ghost"
              onClick={onClose}
            >
              閉じる
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isOpenLogout}
        onClose={onCloseLogout}
        isCentered
        motionPreset="slideInBottom"
        size="sm"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>クラウド同期をオフにする</ModalHeader>
          <ModalCloseButton size="lg" />
          <ModalBody>
            「オフ」を選択するとクラウドから一時的にログアウトします。クラウド上にはログデータ、ユーザデータが残ります。（
            <Text as="span" fontWeight="bold">
              IDを忘れてしまった場合再ログインできなくなるので注意してください
            </Text>
            ）
            <br />
            <br />
            「クラウド削除」を選択するとクラウドのデータを削除してログアウトします。クラウド上のすべてのデータは消え、他端末でログインしている場合もログアウトされます。
            <br />
            どちらを選択しても、ローカル上のデータは引き続き残ります。
          </ModalBody>
          <ModalFooter>
            <Button
              backgroundColor={colors('mainPrimary')}
              onClick={() => {
                logout(true);
              }}
            >
              クラウド削除
            </Button>
            <Button
              backgroundColor={colors('mainPrimary')}
              onClick={() => {
                logout(false);
              }}
              marginX=".5rem"
            >
              オフにする
            </Button>
            <Button
              color={colors('textPrimary')}
              variant="ghost"
              onClick={onCloseLogout}
            >
              閉じる
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isOpenShowId}
        onClose={onCloseShowId}
        isCentered
        motionPreset="slideInBottom"
        size="sm"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>IDを保管してください</ModalHeader>
          <ModalCloseButton size="lg" />
          <ModalBody>
            <Text>
              IDはほかデバイスでログインする際や、再度ログインする場合に必要になります。
              <br />
              忘れてしまうとログインできなくなってしまうため、
              <Text as="span" fontWeight="bold" textDecoration="underline">
                大切に保管
              </Text>
              してください。
              <br />
              （IDは設定からいつでもコピーすることができます。）
            </Text>
            <Flex marginTop="1rem" alignItems="center">
              <Textarea value={user ? user.id : 'Loading...'} resize="none" />
              <Button
                backgroundColor={colors('mainPrimary')}
                onClick={onCopy}
                size="sm"
                marginLeft=".5rem"
              >
                コピー
              </Button>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button
              color={colors('textPrimary')}
              variant="ghost"
              onClick={onCloseShowId}
            >
              閉じる
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ListIcon as={IoSyncOutline} color={colors('mainSecondly')} />
      クラウド同期
      <Box margin=".5rem 0 1.5rem 1.5rem">
        <FormControl display="flex" alignItems="center">
          <Switch
            isChecked={cloud}
            onChange={handleChange}
            id="cloud-switch"
            size="md"
          />
          <FormLabel
            htmlFor="cloud-switch"
            mb="0"
            fontWeight="bold"
            marginLeft=".5rem"
          >
            クラウド同期を利用する
          </FormLabel>
        </FormControl>
      </Box>
    </>
  );
};

export default Sync;
