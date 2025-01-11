export DOCKER_ENABLE_DEPRECATED_PULL_SCHEMA_1_IMAGE=1
sudo chown $(whoami):$(whoami) /media/$(whoami)
mkdir /media/$(whoami)/RPI-RP2
touch /media/$(whoami)/RPI-RP2/INFO_UF2.TXT
sudo -u $(whoami) pxt deploy -l -hw hw---stm32f401
cp /media/$(whoami)/RPI-RP2/ ./compiled -r
python3 uf2/utils/uf2conv.py compiled/RPI-RP2/binary.uf2 --convert --output compiled/firmware.bin
qemu-system-arm -M raspi0 -kernel compiled/firmware.bin
